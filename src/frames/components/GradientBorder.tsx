import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type GradientBorderProps = { children: React.ReactNode; width: number; height: number };

type Corner = { position: string; color: string };

const CORNERS: Corner[] = [
  { position: "0% 0%", color: "255,61,154" }, // pink, top-left
  { position: "100% 0%", color: "123,92,240" }, // purple, top-right
  { position: "100% 100%", color: "0,212,255" }, // cyan, bottom-right
  { position: "0% 100%", color: "123,92,240" }, // purple, bottom-left
];

// Four corner glows breathing at independent phases, layered above the
// content. Content fills the canvas at full size — no reduction.
export const GradientBorder: React.FC<GradientBorderProps> = ({ children }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {CORNERS.map((corner, i) => {
          const opacity = Math.sin(frame / 45 + i * 1.2) * 0.15 + 0.35;
          return (
            <AbsoluteFill
              key={i}
              style={{
                background: `radial-gradient(circle at ${corner.position}, rgba(${corner.color},${opacity}) 0%, transparent 30%)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
