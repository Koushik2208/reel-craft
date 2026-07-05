import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type StickyNoteProps = { children: React.ReactNode; width: number; height: number };

// Content sits inside a pinned sticky note on a neutral desk background,
// with a gentle constant sway as if disturbed by air movement.
export const StickyNote: React.FC<StickyNoteProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();

  const noteWidth = width * 0.84;
  const noteHeight = height * 0.88;
  const noteLeft = (width - noteWidth) / 2;
  const noteTop = (height - noteHeight) / 2;
  const rotation = -1.2 + Math.sin(frame / 80) * 0.3;

  const contentTop = noteHeight * 0.12;
  const contentSide = noteWidth * 0.06;
  const contentBottom = noteHeight * 0.06;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A1A20" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: noteLeft,
          top: noteTop,
          width: noteWidth,
          height: noteHeight,
          backgroundColor: "#F5F0DC",
          borderRadius: 4,
          boxShadow: "4px 8px 24px rgba(0,0,0,0.5), -2px -2px 8px rgba(0,0,0,0.2)",
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: noteHeight * 0.08,
            backgroundColor: "#F5C842",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: noteHeight * 0.15,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(180,160,120,0.35) 0px, rgba(180,160,120,0.35) 1px, transparent 1px, transparent 52px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: contentTop,
            left: contentSide,
            right: contentSide,
            bottom: contentBottom,
            overflow: "hidden",
            clipPath: "inset(0px)",
          }}
        >
          <AbsoluteFill>{children}</AbsoluteFill>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 32,
            height: 32,
            backgroundColor: "#E8E0C8",
            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
