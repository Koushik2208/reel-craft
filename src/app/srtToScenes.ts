import type { Scene } from "./store";
import type { SrtEntry } from "./srtParser";
import { MAX_CHARS_PER_SCENE, splitTextIntoScenes } from "../templates/shared/textSplit";
import { FPS } from "../templates/shared/timing";
import { TEMPLATES } from "../templates/registry";

// Mirrors MANUAL_MIN in store.ts — manual durations are never allowed below this floor.
const MANUAL_MIN_FRAMES = Math.round(1.5 * FPS);

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function makeGeneratedScene(
  text: string,
  durationInFrames: number,
  defaultScene: Partial<Scene>
): Scene {
  const template = defaultScene.template ?? "minimal";
  return {
    id: crypto.randomUUID(),
    template,
    variant: defaultScene.variant ?? TEMPLATES[template].defaultVariant,
    text,
    asset: null,
    durationMode: "manual",
    manualDurationInFrames: Math.max(durationInFrames, MANUAL_MIN_FRAMES),
    language: defaultScene.language ?? "en",
    layerMode: defaultScene.layerMode ?? "full",
    textColorOverride: defaultScene.textColorOverride ?? null,
    frameId: defaultScene.frameId ?? "none",
    overlays: defaultScene.overlays ?? [],
  };
}

export function srtToScenes(entries: SrtEntry[], defaultScene: Partial<Scene> = {}): Scene[] {
  const scenes: Scene[] = [];

  for (const entry of entries) {
    const totalDurationMs = entry.endMs - entry.startMs;

    if (entry.text.length <= MAX_CHARS_PER_SCENE) {
      const durationInFrames = Math.round((totalDurationMs / 1000) * FPS);
      scenes.push(makeGeneratedScene(entry.text, durationInFrames, defaultScene));
      continue;
    }

    const chunks = splitTextIntoScenes(entry.text);
    const chunkWordCounts = chunks.map(wordCount);
    const totalWords = chunkWordCounts.reduce((a, b) => a + b, 0) || 1;

    chunks.forEach((chunk, i) => {
      const share = chunkWordCounts[i] / totalWords;
      const durationInFrames = Math.round(((totalDurationMs * share) / 1000) * FPS);
      scenes.push(makeGeneratedScene(chunk, durationInFrames, defaultScene));
    });
  }

  return scenes;
}
