import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export type NeonSignProps = { children: React.ReactNode; width: number; height: number };

const TUBE_COLORS = ["#FF3D9A", "#7B5CF0", "#00D4FF", "#7B5CF0"] as const;

// Deterministic per-tube flicker: three desynced sine waves multiplied
// together, offset per tube so no two edges dim at the same time.
function flicker(frame: number, phase: number): number {
  const t = frame + phase;
  const raw = Math.sin(t * 0.7) * Math.sin(t * 1.3) * Math.sin(t * 0.4);
  return interpolate(raw, [-1, 1], [0.6, 1.0]);
}

export const NeonSign: React.FC<NeonSignProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();

  const thickness = 3;
  const gradient = "linear-gradient(90deg, #FF3D9A, #7B5CF0, #00D4FF)";
  const glow = "0 0 8px 3px currentColor, 0 0 20px 6px currentColor";

  const tubes = [
    { style: { top: 0, left: 0, right: 0, height: thickness }, phase: 0 }, // top
    { style: { top: 0, right: 0, bottom: 0, width: thickness }, phase: 19 }, // right
    { style: { left: 0, right: 0, bottom: 0, height: thickness }, phase: 38 }, // bottom
    { style: { top: 0, left: 0, bottom: 0, width: thickness }, phase: 57 }, // left
  ];

  const dotSize = 8;
  const corners = [
    { top: -dotSize / 2, left: -dotSize / 2 },
    { top: -dotSize / 2, right: -dotSize / 2 },
    { bottom: -dotSize / 2, right: -dotSize / 2 },
    { bottom: -dotSize / 2, left: -dotSize / 2 },
  ];

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", clipPath: "inset(0px)" }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {tubes.map((tube, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...tube.style,
              background: gradient,
              color: TUBE_COLORS[i],
              boxShadow: glow,
              opacity: flicker(frame, tube.phase),
            }}
          />
        ))}
        {corners.map((corner, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...corner,
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              backgroundColor: TUBE_COLORS[i],
              color: TUBE_COLORS[i],
              boxShadow: glow,
              opacity: flicker(frame, i * 19),
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
