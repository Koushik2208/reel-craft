import React from "react";
import { AbsoluteFill } from "remotion";

export type TvFrameProps = { children: React.ReactNode; width: number; height: number };

// Shell proportions anchored to a 1080x1920 reference. A small top margin is
// reserved so the antenna has room to poke up above the shell.
export const TvFrame: React.FC<TvFrameProps> = ({ children, width, height }) => {
  const shellMarginTop = height * 0.09;
  const shellHeight = height - shellMarginTop;
  const outerRadius = width * 0.08;
  const inset = width * 0.08;
  const screenWidth = width - inset * 2;
  const screenHeight = shellHeight - inset * 2;
  const screenRadius = width * 0.04;
  const antennaHeight = height * 0.1;
  const antennaThickness = Math.max(2, width * 0.0018);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: shellMarginTop,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: outerRadius,
          backgroundColor: "#1C1C1E",
          border: "2px solid #2A2A2A",
          boxShadow: "0 20px 80px rgba(0,0,0,0.9)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: inset,
            top: inset,
            width: screenWidth,
            height: screenHeight,
            borderRadius: screenRadius,
            backgroundColor: "#0A0A0A",
            overflow: "hidden",
            clipPath: `inset(0px round ${screenRadius}px)`,
          }}
        >
          <div
            style={{
              width,
              height,
              transform: `scale(${screenWidth / width}, ${screenHeight / height})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
          <AbsoluteFill
            style={{
              pointerEvents: "none",
              background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, transparent 50%)",
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: shellMarginTop,
          width: antennaThickness,
          height: antennaHeight,
          backgroundColor: "#3A3A3A",
          transformOrigin: "bottom center",
          transform: "translateX(-6px) rotate(-35deg)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: shellMarginTop,
          width: antennaThickness,
          height: antennaHeight,
          backgroundColor: "#3A3A3A",
          transformOrigin: "bottom center",
          transform: "translateX(6px) rotate(35deg)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
