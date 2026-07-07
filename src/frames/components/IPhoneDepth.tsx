import React from "react";
import { AbsoluteFill } from "remotion";

export type IPhoneDepthProps = { children: React.ReactNode; width: number; height: number };

// Immersive full-bleed blur-depth frame: content nearly fills the canvas,
// with a dark, dramatic blurred replay bleeding through at the thin edges.
export const IPhoneDepth: React.FC<IPhoneDepthProps> = ({ children, width, height }) => {
  const contentWidth = width * 0.96;
  const contentHeight = height * 0.96;
  const contentLeft = width * 0.02;
  const contentTop = height * 0.02;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Layer 1 — blurred background replay of the content */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill
          style={{
            transform: "scale(1.15)",
            filter: "blur(50px) brightness(0.5) saturate(1.4)",
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Layer 2 — strong dark vignette over the background */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 3 — content, no shell, no border */}
      <div
        style={{
          position: "absolute",
          left: contentLeft,
          top: contentTop,
          width: contentWidth,
          height: contentHeight,
          borderRadius: 32,
          overflow: "hidden",
          clipPath: "inset(0px round 32px)",
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
