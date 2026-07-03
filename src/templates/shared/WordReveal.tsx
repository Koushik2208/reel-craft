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
  /** frame the reveal starts on; defaults to 0 (start immediately) */
  startAt?: number;
  /** how many frames the whole reveal should span; defaults to the full scene duration */
  spread?: number;
  shadow?: boolean;
  uppercase?: boolean;
};

const FADE_BUFFER_RATIO = 0.08;

// Reveals text one word at a time: each word springs up and fades in,
// staggered evenly across `spread` frames starting at `startAt`. Both
// default to the scene's full durationInFrames so timing scales with
// scene length instead of using fixed frame offsets.
export const WordReveal: React.FC<Props> = ({
  text,
  color,
  fontFamily,
  fontSize,
  fontWeight = 600,
  lineHeight = 1.12,
  letterSpacing = "-0.02em",
  startAt,
  spread,
  shadow = false,
  uppercase = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = text.trim().split(/\s+/).filter(Boolean);
  const resolvedStartAt = startAt ?? 0;
  const resolvedSpread = spread ?? Math.max(1, durationInFrames - resolvedStartAt);
  const per = words.length > 1 ? resolvedSpread / words.length : 0;
  const fadeBuffer = Math.max(1, resolvedSpread * FADE_BUFFER_RATIO);

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
        const local = frame - resolvedStartAt - i * per;
        const enter = spring({ frame: local, fps, config: { damping: 200, mass: 0.7 } });
        const y = interpolate(enter, [0, 1], [fontSize * 0.5, 0]);
        const opacity = interpolate(local, [0, per + fadeBuffer], [0, 1], {
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
