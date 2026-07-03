import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CountdownConfig } from "../types";
import { HEIGHT } from "../../templates/shared/timing";

export const Countdown: React.FC<{ config: CountdownConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const framesPerNumber = fps;
  const totalNumbers = config.startFrom + 1; // startFrom, startFrom-1, ..., 0

  const index = Math.floor(frame / framesPerNumber);
  if (index >= totalNumbers) return null;

  const currentNumber = config.startFrom - index;
  const frameWithinNumber = frame - index * framesPerNumber;
  const scale = spring({ frame: frameWithinNumber, fps, config: { damping: 12, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontSize: HEIGHT * 0.4,
          fontWeight: 800,
          color: "white",
          fontFamily: "sans-serif",
          transform: `scale(${scale})`,
          textShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {currentNumber}
      </div>
    </AbsoluteFill>
  );
};
