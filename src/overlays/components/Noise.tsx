import React from "react";
import { AbsoluteFill } from "remotion";
import type { OverlayIntensity } from "../types";

const INTENSITY: Record<OverlayIntensity, number> = { low: 0.33, medium: 0.66, high: 1.0 };

export const Noise: React.FC<{ intensity: OverlayIntensity }> = ({ intensity }) => {
  const strength = INTENSITY[intensity];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="overlay-noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch">
            <animate attributeName="seed" values="0;100" dur="0.5s" repeatCount="indefinite" />
          </feTurbulence>
        </filter>
        <rect width="100%" height="100%" filter="url(#overlay-noise-filter)" fill="white" opacity={strength * 0.06} />
      </svg>
    </AbsoluteFill>
  );
};
