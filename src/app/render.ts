import { renderMediaOnWeb, getEncodableAudioCodecs } from "@remotion/web-renderer";
import { SceneSeries, type SceneSeriesProps } from "./components/SceneSeries";
import { LinkedComposition, type LinkedCompositionProps } from "./components/LinkedComposition";
import { FPS, WIDTH, HEIGHT } from "../templates/shared/timing";
import type { LayerMode } from "../templates/schema";
import {
  stripObjectUrls,
  type CinematicFinishes,
  type Scene,
  type ProjectAudio,
  type LinkedPair,
} from "./store";

export type RenderHandle = {
  promise: Promise<Blob>;
  cancel: () => void;
};

export type ExportFormat = {
  container: "mp4" | "webm";
  videoCodec: "h264" | "vp9";
  transparent: boolean;
};

// "greenscreen" scenes are text over a solid #00FF00 background — just a
// color, not transparency — so every layer mode exports the same MP4/H.264
// pipeline.
export function getExportFormat(_layerMode: LayerMode): ExportFormat {
  return { container: "mp4", videoCodec: "h264", transparent: false };
}

// Renders entirely in the browser with WebCodecs — no server, no upload.
// `allowHtmlInCanvas` opts into Chromium's experimental drawElementImage API
// when available; most browsers lack it and silently fall back to
// @remotion/web-renderer's built-in DOM-to-canvas composer, which already
// replicates overflow/border-radius/clip-path clipping faithfully. It is not
// what makes exported clipping match the Player preview — the Player clips
// its preview to the exact composition bounds by default, but the renderer's
// offscreen scaffold does not, so any content the composition itself doesn't
// explicitly clip to WIDTH x HEIGHT (see VideoComposition.tsx) can bleed past
// the canvas edge on export while looking fine in preview.
export function renderToMp4(
  props: SceneSeriesProps,
  durationInFrames: number,
  onProgress: (p: number) => void
): RenderHandle {
  const controller = new AbortController();

  const promise = (async () => {
    // Pick the best available audio codec for mp4. AAC is preferred; browsers
    // may only support Opus or PCM — falling back to the first encodable codec
    // avoids a hard failure. If the list is empty, render muted.
    const encodableAudio = await getEncodableAudioCodecs("mp4");
    const preferredOrder = ["aac", "opus", "mp3", "flac", "pcm-s16"] as const;
    const audioCodec =
      preferredOrder.find((c) => encodableAudio.includes(c)) ?? encodableAudio[0] ?? null;

    const { getBlob } = await renderMediaOnWeb({
      composition: {
        id: "video",
        component: SceneSeries,
        durationInFrames,
        fps: FPS,
        width: WIDTH,
        height: HEIGHT,
        defaultProps: props,
      },
      inputProps: props,
      container: "mp4",
      videoCodec: "h264",
      videoBitrate: "high",
      audioCodec: audioCodec ?? null,
      muted: audioCodec === null,
      allowHtmlInCanvas: true,
      signal: controller.signal,
      onProgress: ({ progress }) => onProgress(progress),
    });
    return await getBlob();
  })();

  return { promise, cancel: () => controller.abort() };
}

// Same as renderToMp4 but points the web renderer at the linked-mode
// continuous composition instead of the manual-mode scene series.
export function renderLinkedToMp4(
  props: LinkedCompositionProps,
  durationInFrames: number,
  onProgress: (p: number) => void
): RenderHandle {
  const controller = new AbortController();

  const promise = (async () => {
    const encodableAudio = await getEncodableAudioCodecs("mp4");
    const preferredOrder = ["aac", "opus", "mp3", "flac", "pcm-s16"] as const;
    const audioCodec =
      preferredOrder.find((c) => encodableAudio.includes(c)) ?? encodableAudio[0] ?? null;

    const { getBlob } = await renderMediaOnWeb({
      composition: {
        id: "linked-video",
        component: LinkedComposition,
        durationInFrames,
        fps: FPS,
        width: WIDTH,
        height: HEIGHT,
        defaultProps: props,
      },
      inputProps: props,
      container: "mp4",
      videoCodec: "h264",
      videoBitrate: "high",
      audioCodec: audioCodec ?? null,
      muted: audioCodec === null,
      allowHtmlInCanvas: true,
      signal: controller.signal,
      onProgress: ({ progress }) => onProgress(progress),
    });
    return await getBlob();
  })();

  return { promise, cancel: () => controller.abort() };
}

// Lowercases, turns whitespace into dashes, and strips anything that isn't
// alphanumeric or a dash (this covers the filesystem-invalid characters
// / \ : * ? " < > | and control chars, plus punctuation like "!" that's
// technically valid but not something we want in a generated filename).
export function sanitizeFilenameTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Builds "<sanitized-title><suffix>.<extension>", falling back to `fallback`
// when the title is blank or sanitizes away to nothing.
export function titledFilename(
  projectTitle: string,
  suffix: string,
  extension: string,
  fallback: string
): string {
  const sanitized = sanitizeFilenameTitle(projectTitle);
  return sanitized ? `${sanitized}${suffix}.${extension}` : fallback;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const PROJECT_FILE_VERSION = 1;

// Serializes the full project as JSON and triggers a download. Object URLs
// (asset/audio/background `src`) can't survive the round trip, so they're
// stripped the same way the persisted store strips them on reload.
export function exportProjectJson(state: {
  projectTitle: string;
  projectMode: "manual" | "linked";
  finishes: CinematicFinishes;
  scenes: Scene[];
  activeSceneId: string;
  audio: ProjectAudio;
  linkedPair: LinkedPair;
}): void {
  const payload = { version: PROJECT_FILE_VERSION, ...stripObjectUrls(state) };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const filename = titledFilename(
    state.projectTitle,
    "",
    "reelcraft.json",
    "reelcraft-project.json"
  );
  downloadBlob(blob, filename);
}

// Reads and parses a project JSON file. Only checks the shape needed to
// safely hand the result to `loadProject` — deeper field-level backfilling
// happens there, same as the persisted-store migration.
export async function importProjectJson(file: File): Promise<unknown> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);
  const hasValidShape =
    typeof parsed === "object" &&
    parsed !== null &&
    (parsed as { version?: unknown }).version === PROJECT_FILE_VERSION &&
    Array.isArray((parsed as { scenes?: unknown }).scenes);
  if (!hasValidShape) {
    throw new Error("Invalid project file");
  }
  return parsed;
}
