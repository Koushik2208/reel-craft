import React from "react";
import { AbsoluteFill } from "remotion";

export type DarkSpotlightProps = { children: React.ReactNode; width: number; height: number };

export const DarkSpotlight: React.FC<DarkSpotlightProps> = ({ children }) => {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden", clipPath: "inset(0px)" }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 55% 45% at 50% 42%, transparent 0%, transparent 35%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.96) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
