import React from "react";
import { renderMediaOnWeb } from "@remotion/web-renderer";
import { VideoComposition, type CompositionProps } from "./components/VideoComposition";
import { GrainOverlay, VignetteOverlay, LetterboxOverlay } from "./components/CinematicFinishes";
import { sceneDurationInFrames, type Scene, type CinematicFinishes } from "./store";
import { getExportFormat, type RenderHandle } from "./render";
import { FPS, WIDTH, HEIGHT } from "../templates/shared/timing";

// Mirrors what SceneSeries shows for this scene in the full preview: the
// scene itself plus whatever cinematic finishes are turned on, so a
// single-scene export looks like the equivalent slice of the full render.
function sceneWithFinishes(finishes: CinematicFinishes): React.FC<CompositionProps> {
  return (props) => {
    // Grain/vignette/letterbox would dirty the green and make keying harder.
    const skipFinishes = props.layerMode === "greenscreen";
    return React.createElement(
      VideoComposition,
      props,
      !skipFinishes && finishes.vignette ? React.createElement(VignetteOverlay) : null,
      !skipFinishes && finishes.grain ? React.createElement(GrainOverlay) : null,
      !skipFinishes && finishes.letterbox ? React.createElement(LetterboxOverlay) : null
    );
  };
}

export function renderSceneToFile(
  scene: Scene,
  finishes: CinematicFinishes,
  onProgress: (p: number) => void
): RenderHandle {
  const controller = new AbortController();
  const format = getExportFormat(scene.layerMode);

  const inputProps: CompositionProps = {
    text: scene.text,
    template: scene.template,
    variant: scene.variant,
    backgroundSrc: scene.asset?.src ?? null,
    language: scene.language,
    layerMode: scene.layerMode,
    textColorOverride: scene.textColorOverride ?? null,
    frameId: scene.frameId ?? "none",
    overlays: scene.overlays ?? [],
  };

  const promise = (async () => {
    const { getBlob } = await renderMediaOnWeb({
      composition: {
        id: `scene-${scene.id}`,
        component: sceneWithFinishes(finishes),
        durationInFrames: sceneDurationInFrames(scene),
        fps: FPS,
        width: WIDTH,
        height: HEIGHT,
        defaultProps: inputProps,
      },
      inputProps,
      container: format.container,
      videoCodec: format.videoCodec,
      transparent: format.transparent,
      videoBitrate: "high",
      muted: true,
      allowHtmlInCanvas: true,
      signal: controller.signal,
      onProgress: ({ progress }) => onProgress(progress),
    });
    return await getBlob();
  })();

  return { promise, cancel: () => controller.abort() };
}
