import React from "react";
import { AbsoluteFill } from "remotion";

export type CinematicScopeProps = { children: React.ReactNode; width: number; height: number };

// Bar height anchored to a true 2.39:1 scope crop (~14% of height, taller
// than the 8% letterbox used by the cinematic finish).
export const CinematicScope: React.FC<CinematicScopeProps> = ({ children, height }) => {
  const barHeight = height * 0.14;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden", clipPath: "inset(0px)" }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: barHeight, backgroundColor: "#000" }}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
        </div>
        <div
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: barHeight, backgroundColor: "#000" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
