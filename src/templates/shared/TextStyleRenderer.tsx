import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TEXT_STYLES, type CaptionPosition, type TextStyle } from "./textStyles";

export type TextStyleRendererProps = {
  text: string;
  textStyle: TextStyle;
  durationInFrames: number;
  color: string;
  // These are the RESOLVED values (style default + override applied) —
  // the renderer itself doesn't know about overrides, callers resolve the
  // final values via `resolveTextStyleProps` before passing them in.
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  letterSpacing: string;
  wordSpacing?: string;
  textTransform?: "uppercase" | "lowercase" | "none";
  opacity?: number;
  captionPosition: CaptionPosition;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CENTER_BLOCK: React.CSSProperties = {
  maxWidth: "82%",
  textAlign: "center",
  whiteSpace: "pre-wrap",
};

const POSITION_STYLE: Record<CaptionPosition, React.CSSProperties> = {
  top: { justifyContent: "flex-start", paddingTop: "10%" },
  center: { justifyContent: "center" },
  bottom: { justifyContent: "flex-end", paddingBottom: "12%" },
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

function baseTextStyle(
  color: string,
  fontFamily: string,
  fontWeight: number,
  fontSize: number,
  letterSpacing: string,
  textTransform?: "uppercase" | "lowercase" | "none",
  wordSpacing?: string
): React.CSSProperties {
  return {
    color,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight: 1.3,
    letterSpacing,
    wordSpacing: wordSpacing ?? "0.2em",
    textTransform,
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
  styleOpacity: number;
};

const FadeElegant: React.FC<StyleProps> = ({ words, frame, fps, durationInFrames, baseStyle, styleOpacity }) => {
  const per = durationInFrames / words.length;
  const [exitStart, exitEnd] = safeRange(durationInFrames * 0.85, durationInFrames);
  const exitOpacity = interpolate(frame, [exitStart, exitEnd], [1, 0], CLAMP);
  // Words render as separate flex items (not a single text node), so CSS
  // `word-spacing` has no whitespace to act on — the flex `gap` is what
  // actually controls the visible space between words here.
  const wordGap = String(baseStyle.wordSpacing ?? "0.4em");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        // `gap`'s em unit resolves against this container's own font-size,
        // not the word spans' — without this, it was resolving against the
        // inherited ~16px root size instead of the style's actual fontSize.
        fontSize: baseStyle.fontSize,
        gap: `0.15em ${wordGap}`,
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
              opacity: inOpacity * exitOpacity * styleOpacity,
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

const RevealMask: React.FC<StyleProps> = ({ words, frame, durationInFrames, baseStyle, styleOpacity }) => {
  const { index, local, slot } = activeSlot(words.length, frame, durationInFrames);
  const word = words[index];
  const [wipeStart, wipeEnd] = safeRange(0, slot * 0.5);
  const wipe = interpolate(local, [wipeStart, wipeEnd], [100, 0], CLAMP);

  return (
    <div style={CENTER_BLOCK}>
      <span
        style={{
          ...baseStyle,
          display: "inline-block",
          opacity: styleOpacity,
          clipPath: `inset(0 ${wipe}% 0 0)`,
        }}
      >
        {word}
      </span>
    </div>
  );
};

const BlurResolve: React.FC<StyleProps> = ({ text, frame, durationInFrames, baseStyle, styleOpacity }) => {
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
        opacity: opacity * styleOpacity,
      }}
    >
      {text}
    </div>
  );
};

const Ghost: React.FC<StyleProps> = ({ text, baseStyle, styleOpacity }) => (
  <div style={{ ...baseStyle, ...CENTER_BLOCK, opacity: styleOpacity }}>{text}</div>
);

const LetterExpand: React.FC<StyleProps> = ({ text, frame, durationInFrames, baseStyle, styleOpacity }) => {
  const targetEm = parseFloat(String(baseStyle.letterSpacing)) || 0.12;
  const growEnd = Math.max(1, durationInFrames * 0.25);
  const spacing = interpolate(frame, [0, growEnd], [targetEm + 0.25, targetEm], CLAMP);
  const inOpacity = interpolate(frame, [0, growEnd], [0, 1], CLAMP);
  const [holdEnd, fadeEnd] = safeRange(durationInFrames * 0.9, durationInFrames);
  const outOpacity = interpolate(frame, [holdEnd, fadeEnd], [1, 0], CLAMP);

  return (
    <div
      style={{
        ...baseStyle,
        ...CENTER_BLOCK,
        letterSpacing: `${spacing}em`,
        opacity: Math.min(inOpacity, outOpacity) * styleOpacity,
      }}
    >
      {text}
    </div>
  );
};

const LineByLine: React.FC<StyleProps> = ({ text, frame, durationInFrames, baseStyle, styleOpacity }) => {
  const lines = splitIntoLines(text);
  const slot = Math.max(1, durationInFrames / lines.length);
  const index = Math.min(lines.length - 1, Math.max(0, Math.floor(frame / slot)));

  return <div style={{ ...baseStyle, ...CENTER_BLOCK, opacity: styleOpacity }}>{lines[index]}</div>;
};

const UnderlineWipe: React.FC<StyleProps> = ({ words, frame, durationInFrames, baseStyle, color, styleOpacity }) => {
  const { index, local, slot } = activeSlot(words.length, frame, durationInFrames);
  const word = words[index];
  const [fadeStart, fadeEnd] = safeRange(0, Math.max(1, slot * 0.3));
  const fadeIn = interpolate(local, [fadeStart, fadeEnd], [0, 1], CLAMP);
  const [wipeStart, wipeEnd] = safeRange(slot * 0.25, slot * 0.7);
  const underline = interpolate(local, [wipeStart, wipeEnd], [0, 1], CLAMP);

  return (
    <div style={CENTER_BLOCK}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <span style={{ ...baseStyle, opacity: fadeIn * styleOpacity }}>{word}</span>
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

const SplitReveal: React.FC<StyleProps> = ({ words, frame, durationInFrames, baseStyle, styleOpacity }) => {
  const { index, local, slot } = activeSlot(words.length, frame, durationInFrames);
  const word = words[index];
  const [revealStart, revealEnd] = safeRange(0, Math.max(1, slot * 0.5));
  const clip = interpolate(local, [revealStart, revealEnd], [100, 50], CLAMP);

  return (
    <div style={CENTER_BLOCK}>
      <div style={{ position: "relative", display: "inline-block", opacity: styleOpacity }}>
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
  fontWeight,
  fontSize,
  letterSpacing,
  wordSpacing,
  textTransform,
  opacity,
  captionPosition,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = splitWords(text);
  const baseStyle = baseTextStyle(color, fontFamily, fontWeight, fontSize, letterSpacing, textTransform, wordSpacing);
  const styleOpacity = opacity ?? 1;
  const common: StyleProps = { text, words, frame, fps, durationInFrames, baseStyle, color, styleOpacity };

  const animation = TEXT_STYLES.find((s) => s.id === textStyle)?.animation ?? "fade-elegant";

  let content: React.ReactNode;
  switch (animation) {
    case "reveal-mask":
      content = <RevealMask {...common} />;
      break;
    case "blur-resolve":
      content = <BlurResolve {...common} />;
      break;
    case "ghost":
      content = <Ghost {...common} />;
      break;
    case "letter-expand":
      content = <LetterExpand {...common} />;
      break;
    case "line-by-line":
      content = <LineByLine {...common} />;
      break;
    case "underline-wipe":
      content = <UnderlineWipe {...common} />;
      break;
    case "split-reveal":
      content = <SplitReveal {...common} />;
      break;
    case "fade-elegant":
    default:
      content = <FadeElegant {...common} />;
  }

  return (
    <AbsoluteFill
      style={{
        flexDirection: "column",
        alignItems: "center",
        paddingLeft: "5%",
        paddingRight: "5%",
        ...POSITION_STYLE[captionPosition],
      }}
    >
      {content}
    </AbsoluteFill>
  );
};
