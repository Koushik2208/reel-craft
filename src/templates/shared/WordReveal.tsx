import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  text: string;
  color: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: string;
  /** frame the reveal starts on */
  startAt?: number;
  /** how many frames the whole reveal should span */
  spread?: number;
  shadow?: boolean;
  uppercase?: boolean;
};

// Reveals text one word at a time: each word springs up and fades in,
// staggered evenly across `spread` frames starting at `startAt`.
export const WordReveal: React.FC<Props> = ({
  text,
  color,
  fontFamily,
  fontSize,
  fontWeight = 600,
  lineHeight = 1.12,
  letterSpacing = "-0.02em",
  startAt = 0,
  spread = 30,
  shadow = false,
  uppercase = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.trim().split(/\s+/).filter(Boolean);
  const per = words.length > 1 ? spread / words.length : 0;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `${fontSize * 0.12}px ${fontSize * 0.28}px`,
        maxWidth: "82%",
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const local = frame - startAt - i * per;
        const enter = spring({ frame: local, fps, config: { damping: 200, mass: 0.7 } });
        const y = interpolate(enter, [0, 1], [fontSize * 0.5, 0]);
        const opacity = interpolate(local, [0, per + 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity,
              color,
              fontFamily,
              fontSize,
              fontWeight,
              lineHeight,
              letterSpacing,
              textTransform: uppercase ? "uppercase" : "none",
              textShadow: shadow ? "0 2px 40px rgba(0,0,0,0.55)" : "none",
              whiteSpace: "pre",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
