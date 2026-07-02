import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LayerMode, TemplateId } from "../templates/schema";
import type { Language } from "../templates/shared/language";
import { TEMPLATES } from "../templates/registry";
import { durationInFramesFor, FPS } from "../templates/shared/timing";
import { splitTextIntoScenes } from "../templates/shared/textSplit";
import type { FrameId } from "../frames/types";
import type { ActiveOverlay, OverlayId, OverlayIntensity } from "../overlays/types";

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
};

const MANUAL_MIN = Math.round(1.5 * FPS);
const MANUAL_MAX = Math.round(20 * FPS);

export function sceneDurationInFrames(scene: Scene): number {
  if (scene.durationMode === "manual" && scene.manualDurationInFrames !== undefined) {
    return Math.min(Math.max(scene.manualDurationInFrames, MANUAL_MIN), MANUAL_MAX);
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
  toggleOverlay: (id: OverlayId) => void;
  setOverlayIntensity: (id: OverlayId, intensity: OverlayIntensity) => void;
  applyAutoSplit: (sceneId: string) => void;
  applyStyleToAllScenes: (sourceId: string) => void;
  applyFrameToAllScenes: (sourceId: string) => void;
  applyOverlaysToAllScenes: (sourceId: string) => void;
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
    }),
    {
      name: "reelcraft",
      version: 1,
      // Older persisted scenes predate the `overlays` field; backfill it so
      // components can safely assume it's always an array.
      migrate: (persistedState) => {
        const state = persistedState as Omit<PersistedState, "scenes"> & {
          scenes: (Omit<Scene, "asset" | "overlays"> & { asset: null; overlays?: ActiveOverlay[] })[];
        };
        return {
          ...state,
          scenes: state.scenes.map((s) => ({ ...s, overlays: s.overlays ?? [] })),
        };
      },
      // Object URLs don't survive reload; strip asset from every scene and audio.src.
      partialize: (s): PersistedState => ({
        scenes: s.scenes.map(({ asset: _asset, ...rest }) => ({ ...rest, asset: null })),
        activeSceneId: s.activeSceneId,
        audio: s.audio ? { ...s.audio, src: null } : null,
        finishes: s.finishes,
      }),
    }
  )
);
