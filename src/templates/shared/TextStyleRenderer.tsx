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
  const activeWindow = durationInFrames * 0.75;
  const per = activeWindow / words.length;
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
              opacity: inOpacity * styleOpacity,
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
  const activeWindow = durationInFrames * 0.75;
  const { index, local, slot } = activeSlot(words.length, frame, activeWindow);
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
  const activeWindow = durationInFrames * 0.75;
  const { index, local, slot } = activeSlot(words.length, frame, activeWindow);
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
  const activeWindow = durationInFrames * 0.75;
  const { index, local, slot } = activeSlot(words.length, frame, activeWindow);
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

const KaraokeHighlight: React.FC<StyleProps> = ({ words, frame, durationInFrames, baseStyle, styleOpacity }) => {
  const activeWindow = durationInFrames * 0.75;
  const per = activeWindow / words.length;
  const currentIndex = Math.min(words.length - 1, Math.max(0, Math.floor(frame / per)));

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        fontSize: baseStyle.fontSize,
        gap: "0.15em 0.4em",
        maxWidth: "82%",
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const isCurrent = i === currentIndex;
        const isPast = i < currentIndex;
        return (
          <span
            key={i}
            style={{
              ...baseStyle,
              display: "inline-block",
              opacity: (isCurrent ? 1 : isPast ? 0.4 : 0.25) * styleOpacity,
              backgroundColor: isCurrent ? "rgba(255,180,0,0.85)" : "transparent",
              color: isCurrent ? "#000000" : baseStyle.color,
              borderRadius: isCurrent ? 4 : 0,
              padding: isCurrent ? "2px 8px" : 0,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const WordStamp: React.FC<StyleProps> = ({ words, frame, fps, durationInFrames, baseStyle, styleOpacity }) => {
  const activeWindow = durationInFrames * 0.75;
  const { index, local, slot } = activeSlot(words.length, frame, activeWindow);
  const word = words[index];

  const entrySpring = spring({ frame: local, fps, config: { damping: 8, mass: 1.2 } });
  const entryScale = interpolate(entrySpring, [0, 1], [1.4, 1]);
  const [inStart, inEnd] = safeRange(0, 4);
  const inOpacity = interpolate(local, [inStart, inEnd], [0, 1], CLAMP);
  const [outStart, outEnd] = safeRange(Math.max(0, slot - 4), slot);
  const outScale = interpolate(local, [outStart, outEnd], [1, 0.8], CLAMP);
  const outOpacity = interpolate(local, [outStart, outEnd], [1, 0], CLAMP);
  const scale = local < outStart ? entryScale : outScale;

  return (
    <div style={CENTER_BLOCK}>
      <span
        style={{
          ...baseStyle,
          display: "inline-block",
          opacity: Math.min(inOpacity, outOpacity) * styleOpacity,
          transform: `scale(${scale})`,
        }}
      >
        {word}
      </span>
    </div>
  );
};

const Typewriter: React.FC<StyleProps> = ({ text, frame, durationInFrames, baseStyle, color, styleOpacity }) => {
  const activeWindow = durationInFrames * 0.75;
  const totalChars = Math.max(1, text.length);
  const charsToShow = Math.min(totalChars, Math.floor(frame / (activeWindow / totalChars)));
  const visibleText = text.slice(0, charsToShow);
  const cursorOpacity = frame % 20 < 10 ? 1 : 0;

  return (
    <div style={{ ...baseStyle, ...CENTER_BLOCK, opacity: styleOpacity }}>
      {visibleText}
      <span style={{ opacity: cursorOpacity, color }}>|</span>
    </div>
  );
};

const NeonPulse: React.FC<StyleProps> = ({ words, frame, durationInFrames, baseStyle, color, styleOpacity }) => {
  const activeWindow = durationInFrames * 0.75;
  const { index, local } = activeSlot(words.length, frame, activeWindow);
  const word = words[index];
  const [inStart, inEnd] = safeRange(0, 6);
  const inOpacity = interpolate(local, [inStart, inEnd], [0, 1], CLAMP);
  const intensity = Math.sin(frame * 0.3) * 0.5 + 0.8;
  const textShadow = `0 0 ${10 * intensity}px ${color}, 0 0 ${20 * intensity}px ${color}, 0 0 ${40 * intensity}px rgba(255,61,154,0.6)`;

  return (
    <div style={CENTER_BLOCK}>
      <span
        style={{
          ...baseStyle,
          display: "inline-block",
          color: "#FFFFFF",
          textShadow,
          opacity: inOpacity * styleOpacity,
        }}
      >
        {word}
      </span>
    </div>
  );
};

const SentenceBlock: React.FC<StyleProps> = ({ text, frame, durationInFrames, baseStyle, styleOpacity }) => {
  const lines = splitIntoLines(text, 35);
  const activeWindow = durationInFrames * 0.85;
  const perLine = activeWindow / lines.length;
  const activeLineIndex = Math.min(lines.length - 1, Math.floor(frame / perLine));
  const local = frame - activeLineIndex * perLine;
  const [bgStart, bgEnd] = safeRange(0, 8);
  const activeBgScale = interpolate(local, [bgStart, bgEnd], [0, 1], CLAMP);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: styleOpacity }}>
      {lines.map((line, i) => {
        const isActive = i === activeLineIndex;
        const isPast = i < activeLineIndex;
        const bgScale = isActive ? activeBgScale : isPast ? 1 : 0;
        const textColor = isActive || isPast ? "#0D0D12" : "rgba(255,255,255,0.35)";

        return (
          <div key={i} style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                transform: `scaleX(${bgScale})`,
                transformOrigin: "left",
              }}
            />
            <span
              style={{
                ...baseStyle,
                position: "relative",
                zIndex: 1,
                display: "inline-block",
                padding: "4px 12px",
                color: textColor,
              }}
            >
              {line}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const CASCADE_PALETTE = ["#FF3D9A", "#FFB344", "#7B5CF0", "#00D4FF", "#44FF99"];

const WordCascade: React.FC<StyleProps> = ({ words, frame, baseStyle, styleOpacity }) => {
  const settledFrame = words.length * 3 + 10;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        fontSize: baseStyle.fontSize,
        gap: "0.2em 0.5em",
        maxWidth: "82%",
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const [inStart, inEnd] = safeRange(i * 3, i * 3 + 8);
        const inOpacity = interpolate(frame, [inStart, inEnd], [0, 1], CLAMP);
        const color = CASCADE_PALETTE[i % CASCADE_PALETTE.length];
        const nextColor = CASCADE_PALETTE[(i + 1) % CASCADE_PALETTE.length];
        const shift = frame > settledFrame ? Math.sin(frame * 0.02 + i * 0.5) * 0.5 + 0.5 : 0;

        return (
          <span key={i} style={{ position: "relative", display: "inline-block" }}>
            <span style={{ ...baseStyle, opacity: inOpacity * (1 - shift) * styleOpacity, color }}>{word}</span>
            <span
              style={{
                ...baseStyle,
                position: "absolute",
                left: 0,
                top: 0,
                opacity: inOpacity * shift * styleOpacity,
                color: nextColor,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

const GlitchReveal: React.FC<StyleProps> = ({ text, frame, baseStyle, styleOpacity }) => {
  const [cleanStart, cleanEnd] = safeRange(20, 30);
  const clean = interpolate(frame, [cleanStart, cleanEnd], [0, 1], CLAMP);
  const glitchOpacity = (1 - clean) * styleOpacity;
  const redX = Math.sin(frame * 3.7) * 6;
  const greenX = Math.sin(frame * 2.1 + 1) * -4;
  const blueX = Math.sin(frame * 4.3 + 2) * 8;
  const showSlice = Math.sin(frame * 7.3) > 0.8;
  const sliceY = Math.sin(frame * 5.1) * 200;

  return (
    <div style={{ position: "relative", ...CENTER_BLOCK }}>
      <div
        style={{
          ...baseStyle,
          color: "#FF0000",
          opacity: 0.7 * glitchOpacity,
          transform: `translateX(${redX}px)`,
          mixBlendMode: "screen",
        }}
      >
        {text}
      </div>
      <div
        style={{
          ...baseStyle,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          color: "#00FF00",
          opacity: 0.7 * glitchOpacity,
          transform: `translateX(${greenX}px)`,
          mixBlendMode: "screen",
        }}
      >
        {text}
      </div>
      <div
        style={{
          ...baseStyle,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          color: "#0000FF",
          opacity: 0.7 * glitchOpacity,
          transform: `translateX(${blueX}px)`,
          mixBlendMode: "screen",
        }}
      >
        {text}
      </div>
      <div
        style={{
          ...baseStyle,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          color: "#FFFFFF",
          opacity: clean * styleOpacity,
        }}
      >
        {text}
      </div>
      {showSlice && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `calc(50% + ${sliceY}px)`,
            height: 1,
            backgroundColor: "#FFFFFF",
            opacity: 0.6 * glitchOpacity,
          }}
        />
      )}
    </div>
  );
};

const DropCap: React.FC<StyleProps> = ({ text, words, frame, fps, baseStyle, color, styleOpacity }) => {
  const firstChar = words[0]?.[0] ?? text[0] ?? "";
  const restOfText = text.slice(1);
  const capSpring = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const [restStart, restEnd] = safeRange(8, 28);
  const restOpacity = interpolate(frame, [restStart, restEnd], [0, 1], CLAMP);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: "82%",
        opacity: styleOpacity,
      }}
    >
      <span
        style={{
          ...baseStyle,
          fontSize: (baseStyle.fontSize as number) * 3,
          lineHeight: 0.85,
          marginRight: "0.05em",
          color,
          display: "inline-block",
          transform: `scale(${capSpring})`,
          transformOrigin: "left top",
        }}
      >
        {firstChar}
      </span>
      <span style={{ ...baseStyle, lineHeight: 1.4, opacity: restOpacity }}>{restOfText}</span>
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
    case "karaoke-highlight":
      content = <KaraokeHighlight {...common} />;
      break;
    case "word-stamp":
      content = <WordStamp {...common} />;
      break;
    case "typewriter":
      content = <Typewriter {...common} />;
      break;
    case "neon-pulse":
      content = <NeonPulse {...common} />;
      break;
    case "sentence-block":
      content = <SentenceBlock {...common} />;
      break;
    case "word-cascade":
      content = <WordCascade {...common} />;
      break;
    case "glitch-reveal":
      content = <GlitchReveal {...common} />;
      break;
    case "drop-cap":
      content = <DropCap {...common} />;
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
