import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ProgressBarConfig } from "../types";

export const ProgressBar: React.FC<{ config: ProgressBarConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          [config.position]: 0,
          width: `${progress}%`,
          height: 6,
          background: "linear-gradient(135deg, #FF3D9A, #7B5CF0)",
        }}
      />
    </AbsoluteFill>
  );
};
