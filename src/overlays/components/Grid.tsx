import React from "react";
import { AbsoluteFill } from "remotion";
import type { OverlayIntensity } from "../types";
import { WIDTH, HEIGHT } from "../../templates/shared/timing";

const SETTINGS: Record<OverlayIntensity, { spacing: number; strokeOpacity: number }> = {
  low: { spacing: 80, strokeOpacity: 0.04 },
  medium: { spacing: 60, strokeOpacity: 0.07 },
  high: { spacing: 40, strokeOpacity: 0.11 },
};

export const Grid: React.FC<{ intensity: OverlayIntensity }> = ({ intensity }) => {
  const { spacing, strokeOpacity } = SETTINGS[intensity];

  const verticals = [];
  for (let x = 0; x <= WIDTH; x += spacing) verticals.push(x);
  const horizontals = [];
  for (let y = 0; y <= HEIGHT; y += spacing) horizontals.push(y);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ filter: "blur(0.5px)" }}
      >
        {verticals.map((x) => (
          <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={HEIGHT} stroke="white" strokeOpacity={strokeOpacity} />
        ))}
        {horizontals.map((y) => (
          <line key={`h-${y}`} x1={0} y1={y} x2={WIDTH} y2={y} stroke="white" strokeOpacity={strokeOpacity} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
