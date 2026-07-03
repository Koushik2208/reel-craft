import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { NumberCounterConfig } from "../types";

export const NumberCounter: React.FC<{ config: NumberCounterConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const value = Math.round(
    interpolate(frame, [0, durationInFrames], [config.startNumber, config.endNumber], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", justifyContent: "flex-end", alignItems: "center", paddingBottom: 140 }}
    >
      <div
        style={{
          fontSize: 76,
          fontWeight: 800,
          color: "white",
          fontFamily: "sans-serif",
          textShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {`${config.prefix}${value}${config.suffix}`}
      </div>
    </AbsoluteFill>
  );
};
