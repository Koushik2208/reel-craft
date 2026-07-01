import React from "react";
import { AbsoluteFill } from "remotion";

export type MinimalBezelProps = { children: React.ReactNode; width: number; height: number };

// Shell proportions anchored to a 1080x1920 reference: ~86px sides, ~58px
// top, ~96px bottom -> inner screen ~908x1766.
export const MinimalBezel: React.FC<MinimalBezelProps> = ({ children, width, height }) => {
  const sideThickness = (width * 86) / 1080;
  const topThickness = (height * 58) / 1920;
  const bottomThickness = (height * 96) / 1920;
  const outerRadius = width * 0.1;
  const innerRadius = Math.max(0, outerRadius - sideThickness * 0.5);
  const innerWidth = width - sideThickness * 2;
  const innerHeight = height - topThickness - bottomThickness;

  return (
    <AbsoluteFill
      style={{
        borderRadius: outerRadius,
        backgroundColor: "#1A1A1F",
        boxShadow: "0 0 0 2px #2A2A3A, 0 20px 60px rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: sideThickness,
          top: topThickness,
          width: innerWidth,
          height: innerHeight,
          borderRadius: innerRadius,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${innerWidth / width}, ${innerHeight / height})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: outerRadius,
          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 35%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
