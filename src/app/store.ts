import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LayerMode, TemplateId } from "../templates/schema";
import type { Language } from "../templates/shared/language";
import { TEMPLATES } from "../templates/registry";
import { durationInFramesFor, FPS } from "../templates/shared/timing";
import { splitTextIntoScenes } from "../templates/shared/textSplit";
import type { FrameId } from "../frames/types";
import type { ActiveOverlay, OverlayId, OverlayIntensity } from "../overlays/types";
import type { ImageEffect } from "../templates/shared/imageEffects";
import type { CaptionPosition, TextStyle } from "../templates/shared/textStyles";
import { DEFAULT_TEXT_STYLE, TEXT_STYLE_IDS } from "../templates/shared/textStyles";
import type { ActiveMotion, MotionConfig, MotionId } from "../motion/types";
import { defaultMotionFor } from "../motion/types";

export type { ImageEffect, TextStyle };

export type Asset = { src: string; kind: "image" | "video"; name: string } | null;

export type CinematicFinishes = { grain: boolean; vignette: boolean; letterbox: boolean };

export type ProjectAudio = {
  src: string | null;
  name: string;
  durationInSeconds: number;
  trimStartSeconds: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
} | null;

export type WordTimestamp = { word: string; startMs: number; endMs: number };

export type TranscriptSource = "srt" | "whisper";

export type TranscriptKind =
  | { kind: "block"; blocks: { text: string; startMs: number; endMs: number }[] }
  | { kind: "word"; words: WordTimestamp[] };

// Linked mode's own audio, distinct from `ProjectAudio` (project-level
// background music in manual mode). `src` goes null across reload the same
// way `ProjectAudio.src` does, so the page can prompt to re-attach the file
// while keeping name/trim/fade around.
export type LinkedAudio = {
  src: string | null;
  name: string;
  durationInSeconds: number;
  trimStartSeconds: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
};

// Same shape as `Asset` but with a nullable `src` for the same re-attach-on-reload reason as `LinkedAudio`.
export type LinkedBackground = { src: string | null; kind: "image" | "video"; name: string } | null;

// `audio`/`transcript` start null so a transcript (or audio) can be uploaded
// before its counterpart exists (see LinkedPage edge cases).
export type LinkedPair = {
  audio: LinkedAudio | null;
  transcript: TranscriptKind | null;
  transcriptSource: TranscriptSource | null;
  background: LinkedBackground;
  template: TemplateId;
  variant: string;
  language: Language;
  textColorOverride: string | null;
  frameId: FrameId;
  overlays: ActiveOverlay[];
  motion: ActiveMotion[];
  layerMode: LayerMode;
  imageEffect: ImageEffect;
  textStyle: TextStyle;
  fontOverride: string | null;
  fontWeightOverride: number | null;
  fontSizeOverride: number | null;
  captionPosition: CaptionPosition | null;
} | null;

export const MAX_LINKED_DURATION_SECONDS = 5 * 60;

export function linkedDurationInFrames(linkedPair: NonNullable<LinkedPair>): number {
  if (!linkedPair.audio) return 0;
  const effectiveSeconds = Math.max(
    linkedPair.audio.durationInSeconds - linkedPair.audio.trimStartSeconds,
    0
  );
  const cappedSeconds = Math.min(effectiveSeconds, MAX_LINKED_DURATION_SECONDS);
  return Math.max(Math.round(cappedSeconds * FPS), 1);
}

function makeLinkedPair(overrides?: Partial<NonNullable<LinkedPair>>): NonNullable<LinkedPair> {
  return {
    audio: null,
    transcript: null,
    transcriptSource: null,
    background: null,
    template: "minimal",
    variant: TEMPLATES.minimal.defaultVariant,
    language: "en",
    textColorOverride: null,
    frameId: "none",
    overlays: [],
    motion: [],
    layerMode: "full",
    imageEffect: "zoom-in",
    textStyle: DEFAULT_TEXT_STYLE,
    fontOverride: null,
    fontWeightOverride: null,
    fontSizeOverride: null,
    captionPosition: null,
    ...overrides,
  };
}

function readAudioDuration(src: string): Promise<number> {
  return new Promise((resolve) => {
    const el = new Audio();
    el.addEventListener("loadedmetadata", () => resolve(el.duration), { once: true });
    el.src = src;
    el.load();
  });
}

export type Scene = {
  id: string;
  template: TemplateId;
  variant: string;
  text: string;
  asset: Asset;
  durationMode: "auto" | "manual";
  manualDurationInFrames?: number;
  language: Language;
  layerMode: LayerMode;
  textColorOverride: string | null;
  frameId: FrameId;
  overlays: ActiveOverlay[];
  motion: ActiveMotion[];
  imageEffect: ImageEffect;
  textStyle: TextStyle;
  fontOverride: string | null;
  fontWeightOverride: number | null;
  fontSizeOverride: number | null;
  captionPosition: CaptionPosition | null;
};

const MANUAL_MIN = Math.round(1.5 * FPS);

export function sceneDurationInFrames(scene: Scene): number {
  if (scene.durationMode === "manual" && scene.manualDurationInFrames !== undefined) {
    return Math.max(scene.manualDurationInFrames, MANUAL_MIN);
  }
  return durationInFramesFor(scene.text);
}

function makeScene(overrides?: Partial<Scene>): Scene {
  return {
    id: crypto.randomUUID(),
    template: "minimal",
    variant: TEMPLATES.minimal.defaultVariant,
    text: "",
    asset: null,
    durationMode: "auto",
    language: "en",
    layerMode: "full",
    textColorOverride: null,
    frameId: "none",
    overlays: [],
    motion: [],
    imageEffect: "zoom-in",
    textStyle: DEFAULT_TEXT_STYLE,
    fontOverride: null,
    fontWeightOverride: null,
    fontSizeOverride: null,
    captionPosition: null,
    ...overrides,
  };
}

const DEFAULT_SCENE = makeScene({
  text: "The best ideas feel obvious\nonly after you've had them.",
});

type State = {
  scenes: Scene[];
  activeSceneId: string;
  audio: ProjectAudio;
  finishes: CinematicFinishes;
  projectMode: "manual" | "linked";
  linkedPair: LinkedPair;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  setProjectMode: (mode: "manual" | "linked") => void;
  setLinkedPair: (pair: LinkedPair) => void;
  updateLinkedPairAudio: (partial: Partial<LinkedAudio>) => void;
  updateLinkedPairStyle: (
    partial: Partial<
      Pick<
        NonNullable<LinkedPair>,
        | "template"
        | "variant"
        | "language"
        | "textColorOverride"
        | "frameId"
        | "overlays"
        | "motion"
        | "layerMode"
        | "imageEffect"
        | "textStyle"
        | "fontOverride"
        | "fontWeightOverride"
        | "fontSizeOverride"
        | "captionPosition"
      >
    >
  ) => void;
  clearLinkedPair: () => void;
  setLinkedAudio: (file: File) => Promise<void>;
  setLinkedAudioTrim: (seconds: number) => void;
  setLinkedAudioFadeIn: (seconds: number) => void;
  setLinkedAudioFadeOut: (seconds: number) => void;
  setLinkedTranscript: (transcript: TranscriptKind, source: TranscriptSource) => void;
  setLinkedBackground: (asset: Asset) => void;
  clearLinkedBackground: () => void;
  toggleLinkedOverlay: (id: OverlayId) => void;
  setLinkedOverlayIntensity: (id: OverlayId, intensity: OverlayIntensity) => void;
  toggleLinkedMotion: (id: MotionId) => void;
  setLinkedMotionConfig: (id: MotionId, config: MotionConfig) => void;
  addScene: () => void;
  duplicateScene: (id: string) => void;
  removeScene: (id: string) => void;
  moveScene: (id: string, dir: "up" | "down") => void;
  setActiveScene: (id: string) => void;
  setText: (t: string) => void;
  setTemplate: (t: TemplateId) => void;
  setVariant: (v: string) => void;
  setAsset: (a: Asset) => void;
  clearAsset: () => void;
  setLanguage: (lang: Language) => void;
  setDurationMode: (mode: "auto" | "manual") => void;
  setManualDuration: (frames: number) => void;
  setLayerMode: (mode: LayerMode) => void;
  setTextColorOverride: (color: string | null) => void;
  setFrame: (id: FrameId) => void;
  setImageEffect: (effect: ImageEffect) => void;
  setTextStyle: (style: TextStyle) => void;
  setFontOverride: (font: string | null) => void;
  setFontWeightOverride: (weight: number | null) => void;
  setFontSizeOverride: (size: number | null) => void;
  setCaptionPosition: (position: CaptionPosition | null) => void;
  toggleOverlay: (id: OverlayId) => void;
  setOverlayIntensity: (id: OverlayId, intensity: OverlayIntensity) => void;
  toggleMotion: (id: MotionId) => void;
  setMotionConfig: (id: MotionId, config: MotionConfig) => void;
  applyAutoSplit: (sceneId: string) => void;
  replaceScenes: (scenes: Scene[]) => void;
  appendScenes: (scenes: Scene[]) => void;
  applyStyleToAllScenes: (sourceId: string) => void;
  applyFrameToAllScenes: (sourceId: string) => void;
  applyOverlaysToAllScenes: (sourceId: string) => void;
  applyMotionToAllScenes: (sourceId: string) => void;
  applyImageEffectToAllScenes: (sourceId: string) => void;
  applyTextStyleToAllScenes: (sourceId: string) => void;
  setAudio: (file: File) => Promise<void>;
  setAudioTrim: (seconds: number) => void;
  setAudioFadeIn: (seconds: number) => void;
  setAudioFadeOut: (seconds: number) => void;
  clearAudio: () => void;
  setFinish: (key: keyof CinematicFinishes, value: boolean) => void;
};

type PersistedState = {
  scenes: (Omit<Scene, "asset"> & { asset: null })[];
  activeSceneId: string;
  audio: ProjectAudio;
  finishes: CinematicFinishes;
  projectMode: "manual" | "linked";
  projectTitle: string;
  linkedPair:
    | (Omit<NonNullable<LinkedPair>, "audio" | "background"> & {
        audio: Omit<LinkedAudio, "src"> & { src: null } | null;
        background: Omit<NonNullable<LinkedBackground>, "src"> & { src: null } | null;
      })
    | null;
};

function patchActive(scenes: Scene[], activeId: string, patch: Partial<Scene>): Scene[] {
  return scenes.map((s) => (s.id === activeId ? { ...s, ...patch } : s));
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      scenes: [DEFAULT_SCENE],
      activeSceneId: DEFAULT_SCENE.id,
      audio: null,
      finishes: { grain: false, vignette: false, letterbox: false },
      projectMode: "manual",
      linkedPair: null,
      projectTitle: "",

      setProjectTitle: (title) => set({ projectTitle: title }),

      setProjectMode: (mode) =>
        set((s) => {
          if (s.projectMode === mode) return {};
          if (mode === "linked") {
            const scene = makeScene();
            return { projectMode: "linked", scenes: [scene], activeSceneId: scene.id };
          }
          if (s.linkedPair?.audio?.src) URL.revokeObjectURL(s.linkedPair.audio.src);
          if (s.linkedPair?.background?.src) URL.revokeObjectURL(s.linkedPair.background.src);
          return { projectMode: "manual", linkedPair: null };
        }),

      setLinkedPair: (pair) => set({ linkedPair: pair }),

      updateLinkedPairAudio: (partial) =>
        set((s) => {
          if (!s.linkedPair?.audio) return {};
          return { linkedPair: { ...s.linkedPair, audio: { ...s.linkedPair.audio, ...partial } } };
        }),

      updateLinkedPairStyle: (partial) =>
        set((s) => {
          if (!s.linkedPair) return {};
          return { linkedPair: { ...s.linkedPair, ...partial } };
        }),

      clearLinkedPair: () => {
        const { linkedPair } = get();
        if (linkedPair?.audio?.src) URL.revokeObjectURL(linkedPair.audio.src);
        if (linkedPair?.background?.src) URL.revokeObjectURL(linkedPair.background.src);
        set({ linkedPair: null });
      },

      setLinkedAudio: async (file) => {
        const prev = get().linkedPair?.audio;
        if (prev?.src) URL.revokeObjectURL(prev.src);
        const src = URL.createObjectURL(file);
        const durationInSeconds = await readAudioDuration(src);
        set((s) => {
          const base = s.linkedPair ?? makeLinkedPair();
          // Re-attaching (an `audio` entry already exists, e.g. after a
          // reload stripped its src) should keep the user's trim/fade
          // choices instead of resetting to defaults.
          const existing = base.audio;
          return {
            linkedPair: {
              ...base,
              audio: {
                src,
                name: file.name,
                durationInSeconds,
                trimStartSeconds: Math.min(existing?.trimStartSeconds ?? 0, durationInSeconds),
                fadeInSeconds: existing?.fadeInSeconds ?? 0.5,
                fadeOutSeconds: existing?.fadeOutSeconds ?? 0.5,
              },
            },
          };
        });
      },

      setLinkedAudioTrim: (seconds) => {
        const audio = get().linkedPair?.audio;
        if (!audio) return;
        get().updateLinkedPairAudio({
          trimStartSeconds: Math.max(0, Math.min(seconds, audio.durationInSeconds)),
        });
      },

      setLinkedAudioFadeIn: (seconds) => {
        if (!get().linkedPair?.audio) return;
        get().updateLinkedPairAudio({ fadeInSeconds: Math.max(0, Math.min(seconds, 5)) });
      },

      setLinkedAudioFadeOut: (seconds) => {
        if (!get().linkedPair?.audio) return;
        get().updateLinkedPairAudio({ fadeOutSeconds: Math.max(0, Math.min(seconds, 5)) });
      },

      setLinkedTranscript: (transcript, transcriptSource) =>
        set((s) => {
          const base = s.linkedPair ?? makeLinkedPair();
          return { linkedPair: { ...base, transcript, transcriptSource } };
        }),

      setLinkedBackground: (asset) =>
        set((s) => {
          const prev = s.linkedPair?.background;
          if (prev?.src) URL.revokeObjectURL(prev.src);
          const base = s.linkedPair ?? makeLinkedPair();
          return { linkedPair: { ...base, background: asset } };
        }),

      clearLinkedBackground: () =>
        set((s) => {
          const prev = s.linkedPair?.background;
          if (prev?.src) URL.revokeObjectURL(prev.src);
          if (!s.linkedPair) return {};
          return { linkedPair: { ...s.linkedPair, background: null } };
        }),

      toggleLinkedOverlay: (id) =>
        set((s) => {
          if (!s.linkedPair) return {};
          const exists = s.linkedPair.overlays.some((o) => o.id === id);
          const overlays = exists
            ? s.linkedPair.overlays.filter((o) => o.id !== id)
            : [...s.linkedPair.overlays, { id, intensity: "medium" as OverlayIntensity }];
          return { linkedPair: { ...s.linkedPair, overlays } };
        }),

      toggleLinkedMotion: (id) =>
        set((s) => {
          if (!s.linkedPair) return {};
          const exists = s.linkedPair.motion.some((m) => m.id === id);
          const motion = exists
            ? s.linkedPair.motion.filter((m) => m.id !== id)
            : [...s.linkedPair.motion, defaultMotionFor(id)];
          return { linkedPair: { ...s.linkedPair, motion } };
        }),

      setLinkedMotionConfig: (id, config) =>
        set((s) => {
          if (!s.linkedPair) return {};
          const motion = s.linkedPair.motion.map((m) =>
            m.id === id ? ({ ...m, config } as ActiveMotion) : m
          );
          return { linkedPair: { ...s.linkedPair, motion } };
        }),

      setLinkedOverlayIntensity: (id, intensity) =>
        set((s) => {
          if (!s.linkedPair) return {};
          const overlays = s.linkedPair.overlays.map((o) => (o.id === id ? { ...o, intensity } : o));
          return { linkedPair: { ...s.linkedPair, overlays } };
        }),

      addScene: () => {
        const scene = makeScene({ text: "Type your next scene here." });
        set((s) => ({ scenes: [...s.scenes, scene], activeSceneId: scene.id }));
      },

      duplicateScene: (id) => {
        const { scenes } = get();
        const idx = scenes.findIndex((s) => s.id === id);
        if (idx < 0) return;
        const copy: Scene = { ...scenes[idx], id: crypto.randomUUID(), asset: null };
        const next = [...scenes];
        next.splice(idx + 1, 0, copy);
        set({ scenes: next, activeSceneId: copy.id });
      },

      removeScene: (id) => {
        const { scenes, activeSceneId } = get();
        if (scenes.length <= 1) return;
        const idx = scenes.findIndex((s) => s.id === id);
        if (idx < 0) return;
        const next = scenes.filter((s) => s.id !== id);
        const newActiveId =
          activeSceneId === id ? next[Math.max(0, idx - 1)].id : activeSceneId;
        set({ scenes: next, activeSceneId: newActiveId });
      },

      moveScene: (id, dir) => {
        const { scenes } = get();
        const idx = scenes.findIndex((s) => s.id === id);
        if (idx < 0) return;
        const next = [...scenes];
        if (dir === "up" && idx > 0) {
          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        } else if (dir === "down" && idx < next.length - 1) {
          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        }
        set({ scenes: next });
      },

      setActiveScene: (id) => set({ activeSceneId: id }),

      setText: (text) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { text }) })),

      setTemplate: (template) =>
        set((s) => {
          const style = { template, variant: TEMPLATES[template].defaultVariant };
          return { scenes: patchActive(s.scenes, s.activeSceneId, style) };
        }),

      setVariant: (variant) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { variant }) })),

      setLanguage: (language) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { language }) })),

      setAsset: (asset) =>
        set((s) => {
          const prev = s.scenes.find((sc) => sc.id === s.activeSceneId)?.asset;
          if (prev) URL.revokeObjectURL(prev.src);
          return { scenes: patchActive(s.scenes, s.activeSceneId, { asset }) };
        }),

      clearAsset: () =>
        set((s) => {
          const prev = s.scenes.find((sc) => sc.id === s.activeSceneId)?.asset;
          if (prev) URL.revokeObjectURL(prev.src);
          return { scenes: patchActive(s.scenes, s.activeSceneId, { asset: null }) };
        }),

      setDurationMode: (durationMode) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { durationMode }) })),

      setManualDuration: (manualDurationInFrames) =>
        set((s) => ({
          scenes: patchActive(s.scenes, s.activeSceneId, { manualDurationInFrames }),
        })),

      setLayerMode: (layerMode) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { layerMode }) })),

      setTextColorOverride: (textColorOverride) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { textColorOverride }) })),

      setFrame: (frameId) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { frameId }) })),

      setImageEffect: (imageEffect) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { imageEffect }) })),

      setTextStyle: (textStyle) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { textStyle }) })),

      setFontOverride: (fontOverride) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { fontOverride }) })),

      setFontWeightOverride: (fontWeightOverride) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { fontWeightOverride }) })),

      setFontSizeOverride: (fontSizeOverride) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { fontSizeOverride }) })),

      setCaptionPosition: (captionPosition) =>
        set((s) => ({ scenes: patchActive(s.scenes, s.activeSceneId, { captionPosition }) })),

      toggleOverlay: (id) =>
        set((s) => {
          const active = s.scenes.find((sc) => sc.id === s.activeSceneId);
          if (!active) return {};
          const exists = active.overlays.some((o) => o.id === id);
          const overlays = exists
            ? active.overlays.filter((o) => o.id !== id)
            : [...active.overlays, { id, intensity: "medium" as OverlayIntensity }];
          return { scenes: patchActive(s.scenes, s.activeSceneId, { overlays }) };
        }),

      setOverlayIntensity: (id, intensity) =>
        set((s) => {
          const active = s.scenes.find((sc) => sc.id === s.activeSceneId);
          if (!active) return {};
          const overlays = active.overlays.map((o) => (o.id === id ? { ...o, intensity } : o));
          return { scenes: patchActive(s.scenes, s.activeSceneId, { overlays }) };
        }),

      toggleMotion: (id) =>
        set((s) => {
          const active = s.scenes.find((sc) => sc.id === s.activeSceneId);
          if (!active) return {};
          const exists = active.motion.some((m) => m.id === id);
          const motion = exists
            ? active.motion.filter((m) => m.id !== id)
            : [...active.motion, defaultMotionFor(id)];
          return { scenes: patchActive(s.scenes, s.activeSceneId, { motion }) };
        }),

      setMotionConfig: (id, config) =>
        set((s) => {
          const active = s.scenes.find((sc) => sc.id === s.activeSceneId);
          if (!active) return {};
          const motion = active.motion.map((m) => (m.id === id ? ({ ...m, config } as ActiveMotion) : m));
          return { scenes: patchActive(s.scenes, s.activeSceneId, { motion }) };
        }),

      applyAutoSplit: (sceneId) => {
        const { scenes } = get();
        const idx = scenes.findIndex((s) => s.id === sceneId);
        if (idx < 0) return;
        const scene = scenes[idx];
        const chunks = splitTextIntoScenes(scene.text);
        if (chunks.length <= 1) return;

        const newScenes: Scene[] = chunks.map((chunk) => ({
          ...scene,
          id: crypto.randomUUID(),
          text: chunk,
          durationMode: "auto" as const,
          manualDurationInFrames: undefined,
        }));

        const next = [...scenes];
        next.splice(idx, 1, ...newScenes);
        set({ scenes: next, activeSceneId: newScenes[0].id });
      },

      replaceScenes: (scenes) => {
        if (scenes.length === 0) return;
        set({ scenes, activeSceneId: scenes[0].id });
      },

      appendScenes: (scenes) => {
        if (scenes.length === 0) return;
        set((s) => ({ scenes: [...s.scenes, ...scenes] }));
      },

      setAudio: async (file) => {
        const prev = get().audio;
        if (prev?.src) URL.revokeObjectURL(prev.src);
        const src = URL.createObjectURL(file);
        const durationInSeconds = await readAudioDuration(src);
        set({
          audio: {
            src,
            name: file.name,
            durationInSeconds,
            trimStartSeconds: 0,
            fadeInSeconds: 0.5,
            fadeOutSeconds: 0.5,
          },
        });
      },

      setAudioTrim: (seconds) => {
        const { audio } = get();
        if (!audio) return;
        set({ audio: { ...audio, trimStartSeconds: Math.max(0, Math.min(seconds, audio.durationInSeconds)) } });
      },

      setAudioFadeIn: (seconds) => {
        const { audio } = get();
        if (!audio) return;
        set({ audio: { ...audio, fadeInSeconds: Math.max(0, Math.min(seconds, 5)) } });
      },

      setAudioFadeOut: (seconds) => {
        const { audio } = get();
        if (!audio) return;
        set({ audio: { ...audio, fadeOutSeconds: Math.max(0, Math.min(seconds, 5)) } });
      },

      clearAudio: () => {
        const { audio } = get();
        if (audio?.src) URL.revokeObjectURL(audio.src);
        set({ audio: null });
      },

      setFinish: (key, value) =>
        set((s) => ({ finishes: { ...s.finishes, [key]: value } })),

      applyStyleToAllScenes: (sourceId) => {
        const { scenes } = get();
        const source = scenes.find((s) => s.id === sourceId);
        if (!source) return;
        const style = {
          template: source.template,
          variant: source.variant,
          asset: source.asset,
          layerMode: source.layerMode,
          textStyle: source.textStyle,
          textColorOverride: source.textColorOverride,
          fontOverride: source.fontOverride,
          fontWeightOverride: source.fontWeightOverride,
          fontSizeOverride: source.fontSizeOverride,
          captionPosition: source.captionPosition,
        };
        set({ scenes: scenes.map((s) => (s.id === sourceId ? s : { ...s, ...style })) });
      },

      applyFrameToAllScenes: (sourceId) => {
        const { scenes } = get();
        const source = scenes.find((s) => s.id === sourceId);
        if (!source) return;
        set({
          scenes: scenes.map((s) => (s.id === sourceId ? s : { ...s, frameId: source.frameId })),
        });
      },

      applyOverlaysToAllScenes: (sourceId) => {
        const { scenes } = get();
        const source = scenes.find((s) => s.id === sourceId);
        if (!source) return;
        set({
          scenes: scenes.map((s) => (s.id === sourceId ? s : { ...s, overlays: source.overlays })),
        });
      },

      applyMotionToAllScenes: (sourceId) => {
        const { scenes } = get();
        const source = scenes.find((s) => s.id === sourceId);
        if (!source) return;
        set({
          scenes: scenes.map((s) => (s.id === sourceId ? s : { ...s, motion: source.motion })),
        });
      },

      applyImageEffectToAllScenes: (sourceId) => {
        const { scenes } = get();
        const source = scenes.find((s) => s.id === sourceId);
        if (!source) return;
        set({
          scenes: scenes.map((s) =>
            s.id === sourceId ? s : { ...s, imageEffect: source.imageEffect }
          ),
        });
      },

      applyTextStyleToAllScenes: (sourceId) => {
        const { scenes } = get();
        const source = scenes.find((s) => s.id === sourceId);
        if (!source) return;
        set({
          scenes: scenes.map((s) =>
            s.id === sourceId
              ? s
              : {
                  ...s,
                  textStyle: source.textStyle,
                  textColorOverride: source.textColorOverride,
                  fontOverride: source.fontOverride,
                  fontWeightOverride: source.fontWeightOverride,
                  fontSizeOverride: source.fontSizeOverride,
                  captionPosition: source.captionPosition,
                }
          ),
        });
      },
    }),
    {
      name: "reelcraft",
      version: 5,
      // Older persisted scenes predate the `overlays`/`imageEffect`/`motion`
      // fields; backfill them so components can safely assume they're always set.
      // Version 3 also replaces `linkedPair.captionStyle` with the unified
      // `textStyle` field shared with `Scene` — old caption style values don't
      // map onto the new text style ids, so they're dropped in favor of the default.
      // Version 4 replaces the 8 animation-named text style ids with 12
      // opinionated typographic identities, and adds the font/size/position
      // override fields — old ids don't exist anymore so they fall back to
      // the default, and the new override fields backfill to null (auto).
      // Version 5 unregisters the "clapperboard" frame (moved to the
      // transitions system) — any scene/linkedPair still referencing it
      // falls back to "none".
      migrate: (persistedState) => {
        const state = persistedState as Omit<PersistedState, "scenes" | "linkedPair"> & {
          scenes: (Omit<
            Scene,
            "asset" | "overlays" | "imageEffect" | "motion" | "textStyle" | "fontOverride" | "fontWeightOverride" | "fontSizeOverride" | "captionPosition" | "frameId"
          > & {
            asset: null;
            overlays?: ActiveOverlay[];
            imageEffect?: ImageEffect;
            motion?: ActiveMotion[];
            textStyle?: string;
            fontOverride?: string | null;
            fontWeightOverride?: number | null;
            fontSizeOverride?: number | null;
            captionPosition?: CaptionPosition | null;
            frameId: string;
          })[];
          linkedPair:
            | (Omit<
                NonNullable<PersistedState["linkedPair"]>,
                "imageEffect" | "motion" | "textStyle" | "fontOverride" | "fontWeightOverride" | "fontSizeOverride" | "captionPosition" | "frameId"
              > & {
                imageEffect?: ImageEffect;
                motion?: ActiveMotion[];
                textStyle?: string;
                fontOverride?: string | null;
                fontWeightOverride?: number | null;
                fontSizeOverride?: number | null;
                captionPosition?: CaptionPosition | null;
                frameId: string;
              })
            | null;
        };
        const validTextStyleIds: readonly string[] = TEXT_STYLE_IDS;
        const normalizeTextStyle = (t: string | undefined): TextStyle =>
          t && validTextStyleIds.includes(t) ? (t as TextStyle) : DEFAULT_TEXT_STYLE;
        const normalizeFrameId = (f: string): FrameId => (f === "clapperboard" ? "none" : (f as FrameId));
        return {
          ...state,
          scenes: state.scenes.map((s) => ({
            ...s,
            overlays: s.overlays ?? [],
            imageEffect: s.imageEffect ?? "zoom-in",
            motion: s.motion ?? [],
            textStyle: normalizeTextStyle(s.textStyle),
            fontOverride: s.fontOverride ?? null,
            fontWeightOverride: s.fontWeightOverride ?? null,
            fontSizeOverride: s.fontSizeOverride ?? null,
            captionPosition: s.captionPosition ?? null,
            frameId: normalizeFrameId(s.frameId),
          })),
          linkedPair: state.linkedPair
            ? {
                ...state.linkedPair,
                imageEffect: state.linkedPair.imageEffect ?? "zoom-in",
                motion: state.linkedPair.motion ?? [],
                textStyle: normalizeTextStyle(state.linkedPair.textStyle),
                fontOverride: state.linkedPair.fontOverride ?? null,
                fontWeightOverride: state.linkedPair.fontWeightOverride ?? null,
                fontSizeOverride: state.linkedPair.fontSizeOverride ?? null,
                captionPosition: state.linkedPair.captionPosition ?? null,
                frameId: normalizeFrameId(state.linkedPair.frameId),
              }
            : state.linkedPair,
        };
      },
      // Object URLs don't survive reload; strip asset from every scene and audio.src.
      partialize: (s): PersistedState => ({
        scenes: s.scenes.map(({ asset: _asset, ...rest }) => ({ ...rest, asset: null })),
        activeSceneId: s.activeSceneId,
        audio: s.audio ? { ...s.audio, src: null } : null,
        finishes: s.finishes,
        projectMode: s.projectMode,
        projectTitle: s.projectTitle,
        linkedPair: s.linkedPair
          ? {
              ...s.linkedPair,
              audio: s.linkedPair.audio ? { ...s.linkedPair.audio, src: null } : null,
              background: s.linkedPair.background
                ? { ...s.linkedPair.background, src: null }
                : null,
            }
          : null,
      }),
    }
  )
);
