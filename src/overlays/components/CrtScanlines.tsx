import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { OverlayIntensity } from "../types";
import { HEIGHT } from "../../templates/shared/timing";

const INTENSITY: Record<OverlayIntensity, number> = { low: 0.33, medium: 0.66, high: 1.0 };

const SPACING: Record<OverlayIntensity, { lineSpacing: number; lineHeight: number }> = {
  low: { lineSpacing: 6, lineHeight: 1 },
  medium: { lineSpacing: 4, lineHeight: 1 },
  high: { lineSpacing: 3, lineHeight: 2 },
};

export const CrtScanlines: React.FC<{ intensity: OverlayIntensity }> = ({ intensity }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const strength = INTENSITY[intensity];
  const { lineSpacing, lineHeight } = SPACING[intensity];
  const barY = interpolate(frame, [0, durationInFrames], [0, HEIGHT]);
  const barHeight = HEIGHT * 0.08;

  return (
    <>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${lineSpacing}px, rgba(0,0,0,${strength * 0.55}) ${lineSpacing}px, rgba(0,0,0,${strength * 0.55}) ${lineSpacing + lineHeight}px)`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: barY,
            height: barHeight,
            background: "rgba(255,255,255,1)",
            opacity: strength * 0.12,
          }}
        />
      </AbsoluteFill>
    </>
  );
};
