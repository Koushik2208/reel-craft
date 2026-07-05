import React from "react";
import { AbsoluteFill } from "remotion";

export type SquareBezelProps = { children: React.ReactNode; width: number; height: number };

// Square content window on a pure black shell, with a soft inner glow
// bleeding from the frame edge inward.
export const SquareBezel: React.FC<SquareBezelProps> = ({ children, width, height }) => {
  const contentSize = width * 0.92;
  const contentLeft = (width - contentSize) / 2;
  const contentTop = (height - contentSize) / 2;
  const contentRadius = width * 0.04;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <div
        style={{
          position: "absolute",
          left: contentLeft,
          top: contentTop,
          width: contentSize,
          height: contentSize,
          borderRadius: contentRadius,
          overflow: "hidden",
          clipPath: `inset(0px round ${contentRadius}px)`,
          boxShadow: "inset 0 0 40px 8px rgba(255,255,255,0.12)",
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
