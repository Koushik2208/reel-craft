import React from "react";
import { AbsoluteFill } from "remotion";

export type FrostedGlassProps = { children: React.ReactNode; width: number; height: number };

// Floating frosted glass frame: a clearly bordered panel hovers over a
// blurred replay of the content, with generous blur visible on all sides.
export const FrostedGlass: React.FC<FrostedGlassProps> = ({ children, width, height }) => {
  const panelWidth = width * 0.8;
  const panelHeight = height * 0.65;
  const panelLeft = width * 0.1;
  const panelTop = height * 0.175;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Layer 1 — blurred background replay of the content */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill
          style={{
            transform: "scale(1.1)",
            filter: "blur(20px) brightness(0.8) saturate(1.2)",
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Layer 2 — vignette over the background */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 3 — floating glass panel */}
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: panelTop,
          width: panelWidth,
          height: panelHeight,
          borderRadius: 32,
          overflow: "hidden",
          clipPath: "inset(0px round 32px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Glass tint */}
        <AbsoluteFill style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        {/* Content */}
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
