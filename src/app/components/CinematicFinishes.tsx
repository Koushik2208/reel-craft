import React from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT } from "../../templates/shared/timing";

export const GrainOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 10, mixBlendMode: "overlay" }}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="grain-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch">
          <animate attributeName="seed" values="0;100" dur="0.5s" repeatCount="indefinite" />
        </feTurbulence>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-filter)" fill="white" opacity="0.045" />
    </svg>
  </AbsoluteFill>
);

export const VignetteOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 9 }}>
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.72) 100%)",
      }}
    />
  </AbsoluteFill>
);

const BAR_HEIGHT = Math.round(HEIGHT * 0.08);

export const LetterboxOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 11 }}>
    <div
      style={{ position: "absolute", top: 0, left: 0, right: 0, height: BAR_HEIGHT, background: "#000" }}
    />
    <div
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: BAR_HEIGHT, background: "#000" }}
    />
  </AbsoluteFill>
);
