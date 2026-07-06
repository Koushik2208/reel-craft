import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type WaveformBorderProps = { children: React.ReactNode; width: number; height: number };

const AMPLITUDE = 12;
const STEP = 24;
const GRADIENT_ID = "waveform-border-gradient";

function buildPath(
  axisLength: number,
  baseline: number,
  frequency: number,
  phase: number,
  orientation: "horizontal" | "vertical"
): string {
  const points: string[] = [];
  for (let a = 0; a <= axisLength; a += STEP) {
    const offset = AMPLITUDE * Math.sin(a * frequency + phase);
    const x = orientation === "horizontal" ? a : baseline + offset;
    const y = orientation === "horizontal" ? baseline + offset : a;
    points.push(`${a === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

// Purely decorative living border: four SVG sine-wave paths (one per edge)
// that continuously travel via a frame-driven phase offset. Content renders
// normally underneath, clipped to the full canvas.
export const WaveformBorder: React.FC<WaveformBorderProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const phase = frame * 0.08;

  const topPath = buildPath(width, AMPLITUDE, 0.02, phase, "horizontal");
  const bottomPath = buildPath(width, height - AMPLITUDE, 0.018, phase + 3, "horizontal");
  const leftPath = buildPath(height, AMPLITUDE, 0.022, phase + 1.5, "vertical");
  const rightPath = buildPath(height, width - AMPLITUDE, 0.015, phase + 4.5, "vertical");

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", clipPath: "inset(0px)" }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF3D9A" />
            <stop offset="50%" stopColor="#7B5CF0" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
        {[topPath, bottomPath, leftPath, rightPath].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={`url(#${GRADIENT_ID})`}
            strokeWidth={3}
            fill="none"
            style={{ filter: "drop-shadow(0 0 6px rgba(255,61,154,0.6))" }}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
