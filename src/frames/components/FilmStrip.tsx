import React from "react";
import { AbsoluteFill } from "remotion";

export type FilmStripProps = { children: React.ReactNode; width: number; height: number };

// Sprocket spacing anchored to a 1920px-tall reference (~every 80px).
export const FilmStrip: React.FC<FilmStripProps> = ({ children, width, height }) => {
  const stripWidth = width * 0.06;
  const holeWidth = stripWidth * 0.4;
  const holeHeight = holeWidth * 1.4;
  const spacing = (height * 80) / 1920;
  const holeCount = Math.floor(height / spacing);
  const holes = Array.from({ length: holeCount }, (_, i) => i * spacing + spacing / 2 - holeHeight / 2);

  const strip = (side: "left" | "right") => (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width: stripWidth,
        backgroundColor: "rgba(0,0,0,0.85)",
      }}
    >
      {holes.map((top, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top,
            left: (stripWidth - holeWidth) / 2,
            width: holeWidth,
            height: holeHeight,
            backgroundColor: "#1A1A1F",
            border: "1px solid #333",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );

  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {strip("left")}
        {strip("right")}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
