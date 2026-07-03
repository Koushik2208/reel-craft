import React from "react";
import { AbsoluteFill } from "remotion";
import type { TemplateId, VideoProps } from "../../templates/schema";
import { TEMPLATES } from "../../templates/registry";
import type { FrameId } from "../../frames/types";
import { wrapInFrame } from "../../frames/wrapInFrame";
import type { ActiveOverlay } from "../../overlays/types";
import { RenderOverlays } from "../../overlays/renderOverlays";
import type { ActiveMotion } from "../../motion/types";
import { RenderMotion } from "../../motion/renderMotion";
import { WIDTH, HEIGHT } from "../../templates/shared/timing";

export type CompositionProps = VideoProps & {
  template: TemplateId;
  frameId?: FrameId;
  overlays?: ActiveOverlay[];
  motion?: ActiveMotion[];
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
  motion = [],
  children,
  ...rest
}) => {
  const meta = TEMPLATES[template] ?? TEMPLATES.minimal;
  const Template = meta.component;
  // Clipped to the exact canvas bounds here (not just inside individual frame
  // components) so scenes without a frame (frameId "none") are also clipped.
  // The web renderer's export scaffold, unlike the Player preview, doesn't
  // clip content to the composition size on its own -- content that bleeds
  // past the canvas edge (e.g. a Ken Burns zoom) would render fine in preview
  // but bleed uncontained in the exported video without this.
  const content = (
    <AbsoluteFill style={{ overflow: "hidden", clipPath: "inset(0px)" }}>
      <Template {...rest} />
      {children}
      <RenderOverlays overlays={overlays} />
      <RenderMotion motion={motion} />
    </AbsoluteFill>
  );
  return wrapInFrame(frameId, WIDTH, HEIGHT, content);
};
