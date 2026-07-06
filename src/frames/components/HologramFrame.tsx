import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type HologramFrameProps = { children: React.ReactNode; width: number; height: number };

const CYAN = "#00D4FF";

const GRID =
  "repeating-linear-gradient(0deg, rgba(0,212,255,0.06) 0px, rgba(0,212,255,0.06) 1px, transparent 1px, transparent 40px), " +
  "repeating-linear-gradient(90deg, rgba(0,212,255,0.06) 0px, rgba(0,212,255,0.06) 1px, transparent 1px, transparent 40px)";

// Sci-fi holographic projection: dark stage with a perspective grid floor,
// a tinted clipped content window with scan-line/flicker/interference
// effects, corner triangles that draw in, and a projection base beneath.
export const HologramFrame: React.FC<HologramFrameProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();

  const contentWidth = width * 0.8;
  const contentHeight = height * 0.7;
  const contentLeft = (width - contentWidth) / 2;
  const contentTop = (height - contentHeight) / 2 - height * 0.03;

  const scanY = ((frame % 60) / 60) * contentHeight;
  const flicker = Math.sin(frame * 1.1) * Math.sin(frame * 2.7) * 0.06 + 0.97;

  const interference = [0.2, 0.45, 0.65, 0.85].map((f, i) => ({
    top: contentTop + contentHeight * f,
    jitter: Math.sin(frame * (0.3 + i * 0.13)) * 3,
  }));

  const triDrawIn = Math.min(frame / 20, 1);
  const triLen = 24;
  const triDash = triLen * 2;
  const triOffset = triDash * (1 - triDrawIn);

  const corners: { x: number; y: number; dx: number; dy: number }[] = [
    { x: contentLeft, y: contentTop, dx: 1, dy: 1 },
    { x: contentLeft + contentWidth, y: contentTop, dx: -1, dy: 1 },
    { x: contentLeft, y: contentTop + contentHeight, dx: 1, dy: -1 },
    { x: contentLeft + contentWidth, y: contentTop + contentHeight, dx: -1, dy: -1 },
  ];

  const baseTop = contentTop + contentHeight + 12;
  const baseWidthTop = contentWidth * 0.5;
  const baseWidthBottom = contentWidth * 0.8;
  const baseHeight = height * 0.05;
  const baseLeftTop = width / 2 - baseWidthTop / 2;
  const baseLeftBottom = width / 2 - baseWidthBottom / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.4,
          background: GRID,
          transform: "perspective(800px) rotateX(60deg)",
          transformOrigin: "bottom",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: contentLeft,
          top: contentTop,
          width: contentWidth,
          height: contentHeight,
          overflow: "hidden",
          clipPath: "inset(0px)",
          boxShadow: `inset 0 0 40px 8px rgba(0,212,255,0.3)`,
          opacity: flicker,
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: "rgba(0,212,255,0.08)", pointerEvents: "none" }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 3,
            backgroundColor: "rgba(0,212,255,0.4)",
            pointerEvents: "none",
          }}
        />
        {interference.map((line, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: line.top - contentTop,
              height: 1,
              backgroundColor: "rgba(0,212,255,0.15)",
              transform: `translateX(${line.jitter}px)`,
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {corners.map((c, i) => (
          <path
            key={i}
            d={`M ${c.x + c.dx * triLen} ${c.y} L ${c.x} ${c.y} L ${c.x} ${c.y + c.dy * triLen}`}
            stroke={CYAN}
            strokeWidth={2}
            fill="none"
            strokeDasharray={triDash}
            strokeDashoffset={triOffset}
          />
        ))}
        <polygon
          points={`${baseLeftTop},${baseTop} ${baseLeftTop + baseWidthTop},${baseTop} ${baseLeftBottom + baseWidthBottom},${baseTop + baseHeight} ${baseLeftBottom},${baseTop + baseHeight}`}
          fill={CYAN}
          opacity={0.3}
        />
      </svg>
    </AbsoluteFill>
  );
};
