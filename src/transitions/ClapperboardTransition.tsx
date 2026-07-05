import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

export type ClapperboardTransitionProps = Record<string, never>;

const STRIPES = "repeating-linear-gradient(-45deg, #000 0px, #000 20px, #fff 20px, #fff 40px)";
const HALF_HEIGHT = "52%";

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The exiting scene renders plainly underneath — the entering instance (on
// top, since it paints later) owns the whole clap: two halves slam shut over
// the exiting scene (visible through the gap), flash white at the midpoint,
// then pull away to reveal the entering scene, which only mounts once the
// flash has masked the cut.
const ClapperboardPresentation: React.FC<TransitionPresentationComponentProps<ClapperboardTransitionProps>> = ({
  children,
  presentationProgress,
  presentationDirection,
  presentationDurationInFrames,
}) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
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
    <AbsoluteFill>
      {revealed && <AbsoluteFill>{children}</AbsoluteFill>}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HALF_HEIGHT,
          background: STRIPES,
          transform: `translateY(${topY}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: HALF_HEIGHT,
          background: STRIPES,
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
