import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type FilmStripProps = { children: React.ReactNode; width: number; height: number };

const SPROCKET_CYCLE_FRAMES = 24;

// Sprocket spacing anchored to a 1920px-tall reference (~every 80px). Holes
// scroll continuously; the content window itself stays static.
export const FilmStrip: React.FC<FilmStripProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();

  const stripWidth = width * 0.06;
  const holeWidth = stripWidth * 0.4;
  const holeHeight = holeWidth * 1.4;
  const spacing = (height * 80) / 1920;

  // Render enough holes to cover 2x the strip height so the vertical
  // scroll loop has no visible seam.
  const holeCount = Math.ceil((height * 2) / spacing) + 1;
  const holes = Array.from({ length: holeCount }, (_, i) => i * spacing + spacing / 2 - holeHeight / 2);

  const scrollOffset = (-(frame % SPROCKET_CYCLE_FRAMES) / SPROCKET_CYCLE_FRAMES) * spacing;

  const strip = (side: "left" | "right") => (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width: stripWidth,
        backgroundColor: "rgba(0,0,0,0.85)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -height,
          left: 0,
          right: 0,
          height: height * 2,
          transform: `translateY(${scrollOffset}px)`,
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
    </div>
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden", clipPath: "inset(0px)" }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {strip("left")}
        {strip("right")}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
