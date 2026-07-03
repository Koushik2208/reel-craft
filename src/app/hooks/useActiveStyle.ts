import { useStore } from "../store";
import { TEMPLATES } from "../../templates/registry";
import type { TemplateId, LayerMode } from "../../templates/schema";
import type { Language } from "../../templates/shared/language";
import type { ImageEffect } from "../../templates/shared/imageEffects";
import type { FrameId } from "../../frames/types";
import type { ActiveOverlay, OverlayId, OverlayIntensity } from "../../overlays/types";
import type { ActiveMotion, MotionConfig, MotionId } from "../../motion/types";

export type ActiveStyle =
  | {
      ready: true;
      mode: "manual" | "linked";
      template: TemplateId;
      variant: string;
      language: Language;
      textColorOverride: string | null;
      layerMode: LayerMode;
      imageEffect: ImageEffect;
      frameId: FrameId;
      overlays: ActiveOverlay[];
      hasBackground: boolean;
      setTemplate: (t: TemplateId) => void;
      setVariant: (v: string) => void;
      setLanguage: (l: Language) => void;
      setTextColorOverride: (c: string | null) => void;
      setLayerMode: (m: LayerMode) => void;
      setImageEffect: (e: ImageEffect) => void;
      applyImageEffectToAllScenes: (() => void) | null;
      setFrame: (id: FrameId) => void;
      applyFrameToAllScenes: (() => void) | null;
      toggleOverlay: (id: OverlayId) => void;
      setOverlayIntensity: (id: OverlayId, intensity: OverlayIntensity) => void;
      applyOverlaysToAllScenes: (() => void) | null;
      motion: ActiveMotion[];
      toggleMotion: (id: MotionId) => void;
      setMotionConfig: (id: MotionId, config: MotionConfig) => void;
      applyMotionToAllScenes: (() => void) | null;
    }
  | {
      ready: false;
      mode: "manual" | "linked";
      message: string;
      linkTo: string;
      linkLabel: string;
    };

/**
 * Reads/writes the "active" style target — the active scene in manual mode,
 * or `linkedPair` in linked mode — behind one interface so pages don't each
 * re-implement the manual-vs-linked branch.
 */
export function useActiveStyle(): ActiveStyle {
  const store = useStore();
  const { projectMode, scenes, activeSceneId, linkedPair } = store;

  if (projectMode === "linked") {
    if (!linkedPair) {
      return {
        ready: false,
        mode: "linked",
        message: "No linked pair yet — upload audio or a transcript to get started.",
        linkTo: "/editor/linked",
        linkLabel: "Go to Linked editor",
      };
    }
    const pair = linkedPair;
    return {
      ready: true,
      mode: "linked",
      template: pair.template,
      variant: pair.variant,
      language: pair.language,
      textColorOverride: pair.textColorOverride,
      layerMode: pair.layerMode,
      imageEffect: pair.imageEffect,
      frameId: pair.frameId,
      overlays: pair.overlays,
      hasBackground: pair.background !== null,
      setTemplate: (t) =>
        store.updateLinkedPairStyle({ template: t, variant: TEMPLATES[t].defaultVariant }),
      setVariant: (v) => store.updateLinkedPairStyle({ variant: v }),
      setLanguage: (l) => store.updateLinkedPairStyle({ language: l }),
      setTextColorOverride: (c) => store.updateLinkedPairStyle({ textColorOverride: c }),
      setLayerMode: (m) => store.updateLinkedPairStyle({ layerMode: m }),
      setImageEffect: (e) => store.updateLinkedPairStyle({ imageEffect: e }),
      applyImageEffectToAllScenes: null,
      setFrame: (id) => store.updateLinkedPairStyle({ frameId: id }),
      applyFrameToAllScenes: null,
      toggleOverlay: (id) => store.toggleLinkedOverlay(id),
      setOverlayIntensity: (id, intensity) => store.setLinkedOverlayIntensity(id, intensity),
      applyOverlaysToAllScenes: null,
      motion: pair.motion,
      toggleMotion: (id) => store.toggleLinkedMotion(id),
      setMotionConfig: (id, config) => store.setLinkedMotionConfig(id, config),
      applyMotionToAllScenes: null,
    };
  }

  const scene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0];
  if (!scene) {
    return {
      ready: false,
      mode: "manual",
      message: "No active scene yet.",
      linkTo: "/editor",
      linkLabel: "Go to Editor",
    };
  }
  return {
    ready: true,
    mode: "manual",
    template: scene.template,
    variant: scene.variant,
    language: scene.language,
    textColorOverride: scene.textColorOverride,
    layerMode: scene.layerMode,
    imageEffect: scene.imageEffect,
    frameId: scene.frameId,
    overlays: scene.overlays,
    hasBackground: scene.asset !== null,
    setTemplate: store.setTemplate,
    setVariant: store.setVariant,
    setLanguage: store.setLanguage,
    setTextColorOverride: store.setTextColorOverride,
    setLayerMode: store.setLayerMode,
    setImageEffect: store.setImageEffect,
    applyImageEffectToAllScenes:
      scenes.length > 1 ? () => store.applyImageEffectToAllScenes(scene.id) : null,
    setFrame: store.setFrame,
    applyFrameToAllScenes: scenes.length > 1 ? () => store.applyFrameToAllScenes(scene.id) : null,
    toggleOverlay: store.toggleOverlay,
    setOverlayIntensity: store.setOverlayIntensity,
    applyOverlaysToAllScenes:
      scenes.length > 1 ? () => store.applyOverlaysToAllScenes(scene.id) : null,
    motion: scene.motion,
    toggleMotion: store.toggleMotion,
    setMotionConfig: store.setMotionConfig,
    applyMotionToAllScenes: scenes.length > 1 ? () => store.applyMotionToAllScenes(scene.id) : null,
  };
}
