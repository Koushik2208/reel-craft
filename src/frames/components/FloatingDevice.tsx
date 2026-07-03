import React from "react";
import { AbsoluteFill } from "remotion";

export type FloatingDeviceProps = {
  children: React.ReactNode;
  width: number;
  height: number;
  bgColor?: string;
};

// Phone screen sized well below the canvas and nudged upward, so it reads as
// a device floating on a background rather than filling the frame. No bezel
// — just the clipped screen content and a soft shadow to lift it off the bg.
export const FloatingDevice: React.FC<FloatingDeviceProps> = ({
  children,
  width,
  height,
  bgColor = "#FFFFFF",
}) => {
  const shellWidth = width * 0.62;
  const shellHeight = shellWidth * (height / width);
  const shellTop = height * 0.18;
  const shellLeft = (width - shellWidth) / 2;
  const outerRadius = shellWidth * 0.08;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      <div
        style={{
          position: "absolute",
          left: shellLeft,
          top: shellTop,
          width: shellWidth,
          height: shellHeight,
          borderRadius: outerRadius,
          overflow: "hidden",
          clipPath: `inset(0px round ${outerRadius}px)`,
          boxShadow: "0 32px 120px rgba(0,0,0,0.25)",
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
