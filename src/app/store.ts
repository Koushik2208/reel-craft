import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LayerMode, TemplateId } from "../templates/schema";
import type { Language } from "../templates/shared/language";
import { TEMPLATES } from "../templates/registry";
import { durationInFramesFor, FPS } from "../templates/shared/timing";
import { splitTextIntoScenes } from "../templates/shared/textSplit";

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
    ...overrides,
  };
}

const DEFAULT_SCENE = makeScene({
  text: "The best ideas feel obvious\nonly after you've had them.",
});

type State = {
  scenes: Scene[];
  activeSceneId: string;
  syncStyle: boolean;
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
  applyAutoSplit: (sceneId: string) => void;
  setSyncStyle: (on: boolean) => void;
  applyStyleToAllScenes: (sourceId: string) => void;
  setAudio: (file: File) => Promise<void>;
  setAudioTrim: (seconds: number) => void;
  setAudioFadeIn: (seconds: number) => void;
  setAudioFadeOut: (seconds: number) => void;
  clearAudio: () => void;
  setFinish: (key: keyof CinematicFinishes, value: boolean) => void;
};

function patchActive(scenes: Scene[], activeId: string, patch: Partial<Scene>): Scene[] {
  return scenes.map((s) => (s.id === activeId ? { ...s, ...patch } : s));
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      scenes: [DEFAULT_SCENE],
      activeSceneId: DEFAULT_SCENE.id,
      syncStyle: false,
      audio: null,
      finishes: { grain: false, vignette: false, letterbox: false },

      addScene: () => {
        const { activeSceneId, scenes, syncStyle } = get();
        const active = scenes.find((s) => s.id === activeSceneId);
        const styleOverride =
          syncStyle && active
            ? { template: active.template, variant: active.variant, asset: active.asset, language: active.language }
            : {};
        const scene = makeScene({ text: "Type your next scene here.", ...styleOverride });
        set((s) => ({ scenes: [...s.scenes, scene], activeSceneId: scene.id }));
      },

      duplicateScene: (id) => {
        const { scenes, activeSceneId, syncStyle } = get();
        const idx = scenes.findIndex((s) => s.id === id);
        if (idx < 0) return;
        const active = scenes.find((s) => s.id === activeSceneId);
        const copy: Scene = {
          ...scenes[idx],
          id: crypto.randomUUID(),
          asset: null,
          ...(syncStyle && active
            ? { template: active.template, variant: active.variant, asset: active.asset, language: active.language }
            : {}),
        };
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
          return {
            scenes: s.scenes.map((sc) =>
              s.syncStyle || sc.id === s.activeSceneId ? { ...sc, ...style } : sc
            ),
          };
        }),

      setVariant: (variant) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            s.syncStyle || sc.id === s.activeSceneId ? { ...sc, variant } : sc
          ),
        })),

      setLanguage: (language) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            s.syncStyle || sc.id === s.activeSceneId ? { ...sc, language } : sc
          ),
        })),

      setAsset: (asset) =>
        set((s) => {
          const prev = s.scenes.find((sc) => sc.id === s.activeSceneId)?.asset;
          if (prev) URL.revokeObjectURL(prev.src);
          return {
            scenes: s.scenes.map((sc) =>
              s.syncStyle || sc.id === s.activeSceneId ? { ...sc, asset } : sc
            ),
          };
        }),

      clearAsset: () =>
        set((s) => {
          const prev = s.scenes.find((sc) => sc.id === s.activeSceneId)?.asset;
          if (prev) URL.revokeObjectURL(prev.src);
          return {
            scenes: s.scenes.map((sc) =>
              s.syncStyle || sc.id === s.activeSceneId ? { ...sc, asset: null } : sc
            ),
          };
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

      setSyncStyle: (syncStyle) => set({ syncStyle }),

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
        const style = { template: source.template, variant: source.variant, asset: source.asset, language: source.language };
        set({ scenes: scenes.map((s) => (s.id === sourceId ? s : { ...s, ...style })) });
      },
    }),
    {
      name: "reelcraft",
      // Object URLs don't survive reload; strip asset from every scene and audio.src.
      partialize: (s) => ({
        scenes: s.scenes.map(({ asset: _asset, ...rest }) => ({ ...rest, asset: null })),
        activeSceneId: s.activeSceneId,
        syncStyle: s.syncStyle,
        audio: s.audio ? { ...s.audio, src: null } : null,
        finishes: s.finishes,
      }),
    }
  )
);
