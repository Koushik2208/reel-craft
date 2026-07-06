import React from "react";
import { AbsoluteFill } from "remotion";

export type LandscapeBezelProps = {
  children: React.ReactNode;
  width: number;
  height: number;
  bgColor?: string;
};

// 16:9 landscape content window on a pure black shell, with a soft inner
// glow bleeding from the frame edge inward.
export const LandscapeBezel: React.FC<LandscapeBezelProps> = ({
  children,
  width,
  height,
  bgColor = "#000000",
}) => {
  const contentWidth = width * 0.96;
  const contentHeight = contentWidth * (9 / 16);
  const contentLeft = (width - contentWidth) / 2;
  const contentTop = (height - contentHeight) / 2;
  const contentRadius = width * 0.02;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      <div
        style={{
          position: "absolute",
          left: contentLeft,
          top: contentTop,
          width: contentWidth,
          height: contentHeight,
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
