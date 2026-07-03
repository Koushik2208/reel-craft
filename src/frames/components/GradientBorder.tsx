import React from "react";
import { AbsoluteFill } from "remotion";

export type GradientBorderProps = { children: React.ReactNode; width: number; height: number };

// Border thickness anchored to a 1080px-wide reference (~3% ≈ 32px). The
// outer and inner corner radii share the same center so the ring has no
// seams at the corners.
export const GradientBorder: React.FC<GradientBorderProps> = ({ children, width }) => {
  const thickness = width * 0.03;
  const gradient = "linear-gradient(135deg, #FF3D9A, #7B5CF0, #00D4FF)";
  const glow = "0 0 32px rgba(255,61,154,0.6), 0 0 64px rgba(123,92,240,0.4)";
  const outerRadius = thickness * 2;
  const innerRadius = outerRadius - thickness;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: outerRadius,
          background: gradient,
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
