import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { OverlayIntensity } from "../types";

const INTENSITY: Record<OverlayIntensity, number> = { low: 0.33, medium: 0.66, high: 1.0 };

export const GlowBloom: React.FC<{ intensity: OverlayIntensity }> = ({ intensity }) => {
  const frame = useCurrentFrame();
  const strength = INTENSITY[intensity];
  const opacity = interpolate(Math.sin(frame / 20), [-1, 1], [strength * 0.7, strength]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity,
        background:
          `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(123,92,240,${strength * 0.35}) 0%, rgba(255,61,154,${strength * 0.15}) 40%, transparent 70%)`,
      }}
    />
  );
};
