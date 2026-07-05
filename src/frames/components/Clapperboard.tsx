import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export type ClapperboardProps = { children: React.ReactNode; width: number; height: number };

const STRIPES = "repeating-linear-gradient(-45deg, #000 0px, #000 20px, #fff 20px, #fff 40px)";

// Content renders underneath at full size; the clapperboard halves are a
// top overlay that slams shut at frame 12 then pulls away by frame 18.
export const Clapperboard: React.FC<ClapperboardProps> = ({ children, height }) => {
  const frame = useCurrentFrame();

  const easing = Easing.out(Easing.cubic);
  const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const topY = interpolate(frame, [0, 12, 18], [-50, 0, -110], { ...clampOpts, easing });
  const bottomY = interpolate(frame, [0, 12, 18], [50, 0, 110], { ...clampOpts, easing });
  const flashOpacity = interpolate(frame, [11, 12, 15], [0, 1, 0], clampOpts);

  const halfHeight = height * 0.52;

  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: halfHeight,
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
          height: halfHeight,
          background: STRIPES,
          transform: `translateY(${bottomY}%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: "#FFFFFF",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
