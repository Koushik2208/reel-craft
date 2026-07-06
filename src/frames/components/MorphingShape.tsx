import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type MorphingShapeProps = { children: React.ReactNode; width: number; height: number };

// Content window that morphs circle -> rounded rect -> near-full-screen
// across the scene, driven purely by frame position within the duration.
export const MorphingShape: React.FC<MorphingShapeProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const p1 = durationInFrames * 0.3;
  const p2 = durationInFrames * 0.6;

  const circleW = width * 0.7;
  const circleH = width * 0.7;
  const circleR = circleW / 2;

  const rectW = width * 0.86;
  const rectH = height * 0.6;
  const rectR = width * 0.08;

  const fullW = width * 0.96;
  const fullH = height * 0.92;
  const fullR = width * 0.03;

  const opts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const shapeWidth = interpolate(frame, [0, p1, p2, durationInFrames], [circleW, circleW, rectW, fullW], opts);
  const shapeHeight = interpolate(frame, [0, p1, p2, durationInFrames], [circleH, circleH, rectH, fullH], opts);
  const radius = interpolate(frame, [0, p1, p2, durationInFrames], [circleR, circleR, rectR, fullR], opts);

  const left = (width - shapeWidth) / 2;
  const top = (height - shapeHeight) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0D12" }}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: shapeWidth,
          height: shapeHeight,
          borderRadius: radius,
          overflow: "hidden",
          clipPath: `inset(0px round ${radius}px)`,
          boxShadow: "0 0 0 2px rgba(255,61,154,0.6), 0 0 30px 4px rgba(123,92,240,0.3)",
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
