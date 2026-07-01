import React from "react";
import { AbsoluteFill } from "remotion";

export type VignetteFrameProps = { children: React.ReactNode; width: number; height: number };

export const VignetteFrame: React.FC<VignetteFrameProps> = ({ children }) => {
  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.92) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
