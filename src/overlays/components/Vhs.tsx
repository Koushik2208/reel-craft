import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { OverlayIntensity } from "../types";

const BANDS = [
  { top: 14, height: 2 },
  { top: 37, height: 3 },
  { top: 61, height: 2 },
  { top: 84, height: 4 },
];

// Intensity is ignored — VHS is an on/off overlay.
export const Vhs: React.FC<{ intensity: OverlayIntensity }> = () => {
  const frame = useCurrentFrame();
  const jitter = interpolate(frame % 8, [0, 8], [-20, 20]);

  return (
    <>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {BANDS.map((band, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${band.top}%`,
              left: 0,
              width: "100%",
              height: band.height,
              background: "rgba(255,255,255,0.04)",
              transform: `translateX(${jitter}px)`,
            }}
          />
        ))}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          transform: "translateX(-3px)",
          background: "rgba(255,0,0,0.06)",
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          transform: "translateX(3px)",
          background: "rgba(0,255,255,0.06)",
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill style={{ pointerEvents: "none", background: "rgba(0,0,0,0.08)" }} />
    </>
  );
};
