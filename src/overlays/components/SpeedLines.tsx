import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { OverlayIntensity } from "../types";
import { WIDTH, HEIGHT } from "../../templates/shared/timing";

const LINE_COUNT = 24;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const LENGTH = 1300;

// Intensity is ignored — Speed Lines is an on/off overlay.
export const SpeedLines: React.FC<{ intensity: OverlayIntensity }> = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame % 20, [0, 20], [0.3, 1]);

  const lines = Array.from({ length: LINE_COUNT }, (_, i) => {
    const angle = (i * (360 / LINE_COUNT) * Math.PI) / 180;
    return {
      x2: CENTER_X + LENGTH * Math.cos(angle),
      y2: CENTER_Y + LENGTH * Math.sin(angle),
    };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ overflow: "hidden" }}>
        {lines.map((l, i) => (
          <line
            key={i}
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={l.x2}
            y2={l.y2}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
            opacity={opacity}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
