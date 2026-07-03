import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TextStyle } from "./textStyles";

export type TextStyleRendererProps = {
  text: string;
  textStyle: TextStyle;
  durationInFrames: number;
  color: string;
  fontFamily: string;
  fontSize?: number;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CENTER_BLOCK: React.CSSProperties = {
  maxWidth: "82%",
  textAlign: "center",
  whiteSpace: "pre-wrap",
};

function splitWords(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 ? words : [""];
}

function splitIntoLines(text: string, maxChars = 30): string[] {
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length > 0 ? lines : [text];
}

// A safe two-point range for `interpolate`: guards against zero/negative-length
// windows when `durationInFrames` is very short.
function safeRange(start: number, end: number): [number, number] {
  return end > start ? [start, end] : [start, start + 1];
}

// Splits a scene's duration into equal slots and reports which slot the
// current frame falls in — used by the "one word visible at a time" styles.
function activeSlot(count: number, frame: number, durationInFrames: number) {
  const n = Math.max(1, count);
  const slot = Math.max(1, durationInFrames / n);
  const index = Math.min(n - 1, Math.max(0, Math.floor(frame / slot)));
  return { index, local: frame - index * slot, slot };
}

function baseTextStyle(color: string, fontFamily: string, fontSize: number): React.CSSProperties {
  return {
    color,
    fontFamily,
    fontSize,
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
    textShadow: "0 2px 40px rgba(0,0,0,0.5)",
  };
}

type StyleProps = {
  text: string;
  words: string[];
  frame: number;
  fps: number;
  durationInFrames: number;
  baseStyle: React.CSSProperties;
  color: string;
};

const FadeElegant: React.FC<StyleProps> = ({ words, frame, fps, durationInFrames, baseStyle }) => {
  const per = durationInFrames / words.length;
  const [exitStart, exitEnd] = safeRange(durationInFrames * 0.85, durationInFrames);
  const exitOpacity = interpolate(frame, [exitStart, exitEnd], [1, 0], CLAMP);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.15em 0.4em",
        maxWidth: "82%",
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const local = frame - i * per;
        const enter = spring({ frame: local, fps, config: { damping: 200, mass: 0.7 } });
        const y = interpolate(enter, [0, 1], [4, 0]);
        const [inStart, inEnd] = safeRange(0, Math.max(1, per * 0.6));
        const inOpacity = interpolate(local, [inStart, inEnd], [0, 1], CLAMP);
        return (
          <span
            key={i}
            style={{
              ...baseStyle,
              display: "inline-block",
              opacity: inOpacity * exitOpacity,
              transform: `translateY(${y}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const RevealMask: React.FC<StyleProps> = ({ words, frame, durationInFrames, baseStyle }) => {
  const { index, local, slot } = activeSlot(words.length, frame, durationInFrames);
  const word = words[index];
  const [wipeStart, wipeEnd] = safeRange(0, slot * 0.5);
  const wipe = interpolate(local, [wipeStart, wipeEnd], [100, 0], CLAMP);

  return (
    <div style={CENTER_BLOCK}>
      <span style={{ ...baseStyle, display: "inline-block", clipPath: `inset(0 ${wipe}% 0 0)` }}>
        {word}
      </span>
    </div>
  );
};

const BlurResolve: React.FC<StyleProps> = ({ text, frame, durationInFrames, baseStyle }) => {
  const resolveEnd = Math.max(1, durationInFrames * 0.3);
  const blur = interpolate(frame, [0, resolveEnd], [8, 0], CLAMP);
  const scale = interpolate(frame, [0, resolveEnd], [1.05, 1], CLAMP);
  const [holdEnd, fadeEnd] = safeRange(durationInFrames * 0.9, durationInFrames);
  const opacity = interpolate(frame, [holdEnd, fadeEnd], [1, 0], CLAMP);

  return (
    <div
      style={{
        ...baseStyle,
        ...CENTER_BLOCK,
        filter: `blur(${blur}px)`,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {text}
    </div>
  );
};

const Ghost: React.FC<StyleProps> = ({ text, baseStyle }) => (
  <div style={{ ...baseStyle, ...CENTER_BLOCK, opacity: 0.5 }}>{text}</div>
);

const LetterExpand: React.FC<StyleProps> = ({ text, frame, durationInFrames, baseStyle }) => {
  const growEnd = Math.max(1, durationInFrames * 0.25);
  const spacing = interpolate(frame, [0, growEnd], [0.3, 0.05], CLAMP);
  const inOpacity = interpolate(frame, [0, growEnd], [0, 1], CLAMP);
  const [holdEnd, fadeEnd] = safeRange(durationInFrames * 0.9, durationInFrames);
  const outOpacity = interpolate(frame, [holdEnd, fadeEnd], [1, 0], CLAMP);

  return (
    <div
      style={{
        ...baseStyle,
        ...CENTER_BLOCK,
        letterSpacing: `${spacing}em`,
        opacity: Math.min(inOpacity, outOpacity),
      }}
    >
      {text}
    </div>
  );
};

const LineByLine: React.FC<StyleProps> = ({ text, frame, durationInFrames, baseStyle }) => {
  const lines = splitIntoLines(text);
  const slot = Math.max(1, durationInFrames / lines.length);
  const index = Math.min(lines.length - 1, Math.max(0, Math.floor(frame / slot)));

  return <div style={{ ...baseStyle, ...CENTER_BLOCK }}>{lines[index]}</div>;
};

const UnderlineWipe: React.FC<StyleProps> = ({ words, frame, durationInFrames, baseStyle, color }) => {
  const { index, local, slot } = activeSlot(words.length, frame, durationInFrames);
  const word = words[index];
  const [fadeStart, fadeEnd] = safeRange(0, Math.max(1, slot * 0.3));
  const fadeIn = interpolate(local, [fadeStart, fadeEnd], [0, 1], CLAMP);
  const [wipeStart, wipeEnd] = safeRange(slot * 0.25, slot * 0.7);
  const underline = interpolate(local, [wipeStart, wipeEnd], [0, 1], CLAMP);

  return (
    <div style={CENTER_BLOCK}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <span style={{ ...baseStyle, opacity: fadeIn }}>{word}</span>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -10,
            height: 1,
            backgroundColor: color,
            transform: `scaleX(${underline})`,
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
};

const SplitReveal: React.FC<StyleProps> = ({ words, frame, durationInFrames, baseStyle }) => {
  const { index, local, slot } = activeSlot(words.length, frame, durationInFrames);
  const word = words[index];
  const [revealStart, revealEnd] = safeRange(0, Math.max(1, slot * 0.5));
  const clip = interpolate(local, [revealStart, revealEnd], [100, 50], CLAMP);

  return (
    <div style={CENTER_BLOCK}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <span style={{ ...baseStyle, visibility: "hidden" }}>{word}</span>
        <span style={{ ...baseStyle, position: "absolute", left: 0, top: 0, clipPath: `inset(0 0 ${clip}% 0)` }}>
          {word}
        </span>
        <span
          style={{ ...baseStyle, position: "absolute", left: 0, top: 0, clipPath: `inset(${clip}% 0 0 0)` }}
        >
          {word}
        </span>
      </div>
    </div>
  );
};

export const TextStyleRenderer: React.FC<TextStyleRendererProps> = ({
  text,
  textStyle,
  durationInFrames,
  color,
  fontFamily,
  fontSize = 52,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = splitWords(text);
  const baseStyle = baseTextStyle(color, fontFamily, fontSize);
  const common: StyleProps = { text, words, frame, fps, durationInFrames, baseStyle, color };

  switch (textStyle) {
    case "reveal-mask":
      return <RevealMask {...common} />;
    case "blur-resolve":
      return <BlurResolve {...common} />;
    case "ghost":
      return <Ghost {...common} />;
    case "letter-expand":
      return <LetterExpand {...common} />;
    case "line-by-line":
      return <LineByLine {...common} />;
    case "underline-wipe":
      return <UnderlineWipe {...common} />;
    case "split-reveal":
      return <SplitReveal {...common} />;
    case "fade-elegant":
    default:
      return <FadeElegant {...common} />;
  }
};
