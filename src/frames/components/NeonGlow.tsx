import React from "react";
import { AbsoluteFill } from "remotion";

export type NeonGlowProps = { children: React.ReactNode; width: number; height: number };

// Border thickness anchored to a 1080px-wide reference (~1.5% ≈ 16px). The
// outer and inner corner radii share the same center so the ring has no
// seams at the corners.
export const NeonGlow: React.FC<NeonGlowProps> = ({ children, width }) => {
  const thickness = width * 0.015;
  const color = "#00D4FF";
  const glow = `0 0 16px ${color}, 0 0 48px rgba(0,212,255,0.5), 0 0 96px rgba(0,212,255,0.2)`;
  const outerRadius = thickness * 2;
  const innerRadius = outerRadius - thickness;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: outerRadius,
          backgroundColor: color,
          boxShadow: glow,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: thickness,
            left: thickness,
            right: thickness,
            bottom: thickness,
            borderRadius: innerRadius,
            overflow: "hidden",
            clipPath: `inset(0px round ${innerRadius}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
