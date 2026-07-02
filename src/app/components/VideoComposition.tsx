import React from "react";
import { AbsoluteFill } from "remotion";
import type { TemplateId, VideoProps } from "../../templates/schema";
import { TEMPLATES } from "../../templates/registry";
import type { FrameId } from "../../frames/types";
import { wrapInFrame } from "../../frames/wrapInFrame";
import type { ActiveOverlay } from "../../overlays/types";
import { RenderOverlays } from "../../overlays/renderOverlays";
import { WIDTH, HEIGHT } from "../../templates/shared/timing";

export type CompositionProps = VideoProps & {
  template: TemplateId;
  frameId?: FrameId;
  overlays?: ActiveOverlay[];
};

// One component the Player and the renderer both point at. Picking the
// template here (rather than swapping the Player's component) keeps a single
// stable composition id, which the web renderer wants.
//
// `children` (cinematic finish overlays) and `overlays` (per-scene overlay
// stack) render alongside the template output *inside* the frame wrapper, so
// grain/vignette/letterbox/overlays are part of the framed scene rather than
// floating on top of the device shell.
export const VideoComposition: React.FC<CompositionProps & { children?: React.ReactNode }> = ({
  template,
  frameId = "none",
  overlays = [],
  children,
  ...rest
}) => {
  const meta = TEMPLATES[template] ?? TEMPLATES.minimal;
  const Template = meta.component;
  const content = (
    <AbsoluteFill>
      <Template {...rest} />
      {children}
      <RenderOverlays overlays={overlays} />
    </AbsoluteFill>
  );
  return wrapInFrame(frameId, WIDTH, HEIGHT, content);
};
