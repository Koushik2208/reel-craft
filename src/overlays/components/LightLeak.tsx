import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { OverlayIntensity } from "../types";

const INTENSITY: Record<OverlayIntensity, number> = { low: 0.33, medium: 0.66, high: 1.0 };

const Blob: React.FC<{ x: number; y: number; strength: number }> = ({ x, y, strength }) => (
  <div
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: "80%",
      height: "60%",
      transform: "translate(-50%, -50%)",
      background: `radial-gradient(ellipse, rgba(255,150,50,${strength * 0.45}) 0%, transparent 70%)`,
      mixBlendMode: "screen",
    }}
  />
);

export const LightLeak: React.FC<{ intensity: OverlayIntensity }> = ({ intensity }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const strength = INTENSITY[intensity];

  const x = interpolate(frame, [0, durationInFrames], [-20, 120]);
  const y = Math.sin(frame / 30) * 10 + 30;

  const halfDuration = durationInFrames / 2;
  const secondFrame = (frame + halfDuration) % durationInFrames;
  const x2 = interpolate(secondFrame, [0, durationInFrames], [-20, 120]);
  const y2 = Math.sin(secondFrame / 30) * 10 + 30;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Blob x={x} y={y} strength={strength} />
      {intensity === "high" && <Blob x={x2} y={y2} strength={strength} />}
    </AbsoluteFill>
  );
};
