import React from "react";
import { AbsoluteFill } from "remotion";
import type { OverlayIntensity } from "../types";
import { WIDTH, HEIGHT } from "../../templates/shared/timing";

const SETTINGS: Record<OverlayIntensity, { dotRadius: number; spacing: number; opacity: number }> = {
  low: { dotRadius: 1.5, spacing: 18, opacity: 0.08 },
  medium: { dotRadius: 2, spacing: 14, opacity: 0.12 },
  high: { dotRadius: 3, spacing: 12, opacity: 0.18 },
};

export const Halftone: React.FC<{ intensity: OverlayIntensity }> = ({ intensity }) => {
  const { dotRadius, spacing, opacity } = SETTINGS[intensity];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <defs>
          <pattern id="halftone-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle cx={spacing / 2} cy={spacing / 2} r={dotRadius} fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#halftone-pattern)" opacity={opacity} />
      </svg>
    </AbsoluteFill>
  );
};
