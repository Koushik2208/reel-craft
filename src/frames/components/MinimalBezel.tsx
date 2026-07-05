import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type MinimalBezelProps = { children: React.ReactNode; width: number; height: number };

// Premium phone shell: pure black outer, large-radius content window
// floating slightly above center, with a slow-pulsing ambient screen glow.
export const MinimalBezel: React.FC<MinimalBezelProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();

  const contentWidth = width * 0.78;
  const contentHeight = height * 0.82;
  const contentLeft = (width - contentWidth) / 2;
  const contentTop = height * 0.09;
  const contentRadius = contentWidth * 0.18;

  const glowOpacity = Math.sin(frame / 40) * 0.03 + 0.06;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <div
        style={{
          position: "absolute",
          left: contentLeft - contentWidth * 0.15,
          top: contentTop - contentHeight * 0.1,
          width: contentWidth * 1.3,
          height: contentHeight * 1.2,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, rgba(255,255,255,${glowOpacity}) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
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
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
      <div
        style={{
          position: "absolute",
          left: width / 2 - 4,
          top: height * 0.04 - 4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#1A1A1A",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: width / 2 - 30,
          bottom: height * 0.035 - 2,
          width: 60,
          height: 4,
          borderRadius: 2,
          backgroundColor: "#333",
        }}
      />
    </AbsoluteFill>
  );
};
