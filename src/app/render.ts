import { renderMediaOnWeb, getEncodableAudioCodecs } from "@remotion/web-renderer";
import { SceneSeries, type SceneSeriesProps } from "./components/SceneSeries";
import { FPS, WIDTH, HEIGHT } from "../templates/shared/timing";
import type { LayerMode } from "../templates/schema";

export type RenderHandle = {
  promise: Promise<Blob>;
  cancel: () => void;
};

export type ExportFormat = {
  container: "mp4" | "webm";
  videoCodec: "h264" | "vp9";
  transparent: boolean;
};

// Transparent export only works with WebM/VP9 in-browser — MP4/H.264 has no
// alpha support in WebCodecs. "text-only" scenes need the alpha channel;
// everything else keeps the current MP4 pipeline.
export function getExportFormat(layerMode: LayerMode): ExportFormat {
  if (layerMode === "text-only") {
    return { container: "webm", videoCodec: "vp9", transparent: true };
  }
  return { container: "mp4", videoCodec: "h264", transparent: false };
}

// Renders entirely in the browser with WebCodecs — no server, no upload.
// `allowHtmlInCanvas` takes a real screenshot per frame so gradients, fonts
// and filters render exactly like the preview.
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
