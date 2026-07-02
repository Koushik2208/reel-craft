import React from "react";
import { AbsoluteFill } from "remotion";
import type { OverlayIntensity } from "../types";

const INTENSITY: Record<OverlayIntensity, number> = { low: 0.33, medium: 0.66, high: 1.0 };

export const Halation: React.FC<{ intensity: OverlayIntensity }> = ({ intensity }) => {
  const strength = INTENSITY[intensity];

  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          mixBlendMode: "screen",
          background: `radial-gradient(ellipse 90% 60% at 50% 20%, rgba(255,220,180,${strength * 0.25}) 0%, transparent 65%)`,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          mixBlendMode: "soft-light",
          background: `rgba(255,200,150,${strength * 0.06})`,
        }}
      />
    </>
  );
};
