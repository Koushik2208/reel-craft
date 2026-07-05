import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

export type ClapperboardTransitionProps = Record<string, never>;

// Baked full-size raster (see scripts/generate-transition-assets.js) instead
// of a live CSS repeating-linear-gradient. Confirmed by an actual export:
// the web-renderer's gradient support doesn't implement the "repeating"
// tiling — it draws one gradient cycle stretched across the whole element,
// which is exactly the smooth diagonal fade (not bands) that showed up in
// the exported video. A single plain <Img>, sized to fill, needs no repeat
// semantics from the renderer at all.
const STRIPES_SRC = staticFile("transitions/clapperboard-stripes.png");
const HALF_HEIGHT = "52%";

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Stripes: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={{ ...style, overflow: "hidden" }}>
    <Img src={STRIPES_SRC} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

// The exiting scene renders plainly underneath — the entering instance (on
// top) owns the whole clap: two halves slam shut over the exiting scene
// (visible through the gap), flash white at the midpoint, then pull away to
// reveal the entering scene, which only mounts once the flash has masked
// the cut. Both layers get an explicit zIndex rather than relying on paint
// order, since stacking order that's merely implicit in DOM order is one
// more thing a hand-rolled compositor can resolve differently than a real
// browser does.
const ClapperboardPresentation: React.FC<TransitionPresentationComponentProps<ClapperboardTransitionProps>> = ({
  children,
  presentationProgress,
  presentationDirection,
  presentationDurationInFrames,
}) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ zIndex: 0 }}>{children}</AbsoluteFill>;
  }

  const topY = interpolate(presentationProgress, [0, 0.5, 1], [-60, 0, -110], clampOpts);
  const bottomY = interpolate(presentationProgress, [0, 0.5, 1], [60, 0, 110], clampOpts);
  const flashHalfWidth = 1 / presentationDurationInFrames;
  const flashOpacity = interpolate(
    presentationProgress,
    [0.5 - flashHalfWidth, 0.5, 0.5 + flashHalfWidth],
    [0, 1, 0],
    clampOpts
  );
  const revealed = presentationProgress >= 0.5;

  return (
    <AbsoluteFill style={{ zIndex: 1 }}>
      {revealed && <AbsoluteFill>{children}</AbsoluteFill>}
      <Stripes
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HALF_HEIGHT,
          transform: `translateY(${topY}%)`,
        }}
      />
      <Stripes
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: HALF_HEIGHT,
          transform: `translateY(${bottomY}%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: flashOpacity, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const clapperboardTransition = (): TransitionPresentation<ClapperboardTransitionProps> => ({
  component: ClapperboardPresentation,
  props: {},
});
