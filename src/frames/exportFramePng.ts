import { renderStillOnWeb } from "@remotion/web-renderer";
import { GreenScreenScene } from "./GreenScreenScene";
import { downloadBlob } from "../app/render";
import { FPS, WIDTH, HEIGHT } from "../templates/shared/timing";
import type { FrameId } from "./types";

export async function exportFrameAsPng(frameId: FrameId, filename: string): Promise<void> {
  const inputProps = { frameId };

  const result = await renderStillOnWeb({
    frame: 0,
    composition: {
      id: "green-screen-frame",
      component: GreenScreenScene,
      durationInFrames: 1,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
      defaultProps: inputProps,
    },
    inputProps,
    allowHtmlInCanvas: true,
  });

  const blob = await result.blob({ format: "png" });
  downloadBlob(blob, filename);
}
