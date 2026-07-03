import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  MAX_LINKED_DURATION_SECONDS,
  type CaptionStyle,
  type LinkedPair,
  type WordTimestamp,
} from "../store";
import { getFontsForLanguage } from "../../templates/shared/language";
import { sampleBackgroundBrightness } from "../../templates/shared/sampleBrightness";
import { getContrastAdjustment } from "../../templates/shared/autoContrast";
import { MAX_CHARS_PER_SCENE } from "../../templates/shared/textSplit";

type Props = { linkedPair: NonNullable<LinkedPair> };

type CaptionUnit = {
  key: string;
  startFrame: number;
  endFrame: number;
  text: string;
  words?: { word: string; startFrame: number; endFrame: number }[];
};

const FADE_MS = 150;
const MAX_MS = MAX_LINKED_DURATION_SECONDS * 1000;

// Maps an original-audio timestamp to a frame in the (post-trim) composition
// timeline. Returns null when the timestamp falls before the trim point, so
// the caller can skip words/blocks that were trimmed away.
function toFrame(ms: number, fps: number, trimStartSeconds: number): number | null {
  const adjustedMs = ms - trimStartSeconds * 1000;
  if (adjustedMs < 0) return null;
  return Math.round((adjustedMs / 1000) * fps);
}

// Packs words into TikTok-style caption lines, each capped at the same
// character budget manual-mode scenes use.
function groupWordsIntoLines(words: WordTimestamp[]): WordTimestamp[][] {
  const lines: WordTimestamp[][] = [];
  let current: WordTimestamp[] = [];
  let currentLen = 0;
  for (const w of words) {
    const addLen = currentLen === 0 ? w.word.length : currentLen + 1 + w.word.length;
    if (addLen > MAX_CHARS_PER_SCENE && current.length > 0) {
      lines.push(current);
      current = [w];
      currentLen = w.word.length;
    } else {
      current.push(w);
      currentLen = addLen;
    }
  }
  if (current.length) lines.push(current);
  return lines;
}

function fadeFramesFor(totalFrames: number, fps: number): number {
  return Math.min(
    Math.max(1, Math.round((FADE_MS / 1000) * fps)),
    Math.max(1, Math.floor(totalFrames / 2))
  );
}

function fadeEnvelope(local: number, totalFrames: number, fadeFrames: number): number {
  return interpolate(
    local,
    [0, fadeFrames, Math.max(fadeFrames, totalFrames - fadeFrames), totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

const containerStyle: React.CSSProperties = {
  justifyContent: "flex-end",
  alignItems: "center",
  paddingBottom: 260,
  paddingLeft: "9%",
  paddingRight: "9%",
};

const CaptionUnitView: React.FC<{
  unit: CaptionUnit;
  captionStyle: CaptionStyle;
  frame: number;
  fps: number;
  textStyle: React.CSSProperties;
  textColor: string;
}> = ({ unit, captionStyle, frame, fps, textStyle, textColor }) => {
  const local = frame - unit.startFrame;
  const totalFrames = Math.max(unit.endFrame - unit.startFrame, 1);
  const fadeFrames = fadeFramesFor(totalFrames, fps);

  // Word-level highlight: dim every word but the one currently being
  // spoken. Falls through to the plain fade below when there's no
  // per-word data (block/SRT transcripts have no word timestamps).
  if (captionStyle === "highlight" && unit.words) {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.15em 0.4em",
          maxWidth: "100%",
        }}
      >
        {unit.words.map((w, i) => {
          const isActive = frame >= w.startFrame && frame <= w.endFrame;
          return (
            <span key={i} style={{ ...textStyle, opacity: isActive ? 1 : 0.5, color: textColor }}>
              {w.word}
            </span>
          );
        })}
      </div>
    );
  }

  if (captionStyle === "pop") {
    const enter = spring({ frame: local, fps, config: { damping: 12 } });
    const scale = interpolate(enter, [0, 1], [0.8, 1], { extrapolateRight: "clamp" });
    const opacity = fadeEnvelope(local, totalFrames, fadeFrames);
    return (
      <div style={{ ...textStyle, opacity, color: textColor, transform: `scale(${scale})` }}>
        {unit.text}
      </div>
    );
  }

  if (captionStyle === "typewriter") {
    const charProgress = interpolate(local, [0, Math.max(1, totalFrames * 0.85)], [0, unit.text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const visibleChars = Math.floor(charProgress);
    const exitStart = Math.max(0, totalFrames - fadeFrames);
    const opacity =
      local >= exitStart
        ? interpolate(local, [exitStart, totalFrames], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : 1;
    return (
      <div style={{ ...textStyle, opacity, color: textColor }}>{unit.text.slice(0, visibleChars)}</div>
    );
  }

  if (captionStyle === "slide-up") {
    const opacity = fadeEnvelope(local, totalFrames, fadeFrames);
    const translateY = interpolate(local, [0, fadeFrames], [24, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <div style={{ ...textStyle, opacity, color: textColor, transform: `translateY(${translateY}px)` }}>
        {unit.text}
      </div>
    );
  }

  // "fade" (default), and the "highlight" fallback for block transcripts.
  const opacity = fadeEnvelope(local, totalFrames, fadeFrames);
  return <div style={{ ...textStyle, opacity, color: textColor }}>{unit.text}</div>;
};

export const LinkedCaptions: React.FC<Props> = ({ linkedPair }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontsForLanguage(linkedPair.language);
  const trimStartSeconds = linkedPair.audio?.trimStartSeconds ?? 0;
  const backgroundSrc = linkedPair.background?.src ?? null;

  const [brightness, setBrightness] = useState(0.4);
  useEffect(() => {
    if (!backgroundSrc) {
      setBrightness(0.4);
      return;
    }
    sampleBackgroundBrightness(backgroundSrc).then(setBrightness);
  }, [backgroundSrc]);

  const adjustment = backgroundSrc
    ? getContrastAdjustment(brightness)
    : { textColor: "#FFFFFF", overlayOpacity: 1 };
  const textColor = linkedPair.textColorOverride ?? adjustment.textColor;
  const lineHeight = linkedPair.language === "te" ? 1.28 : 1.18;

  const words = linkedPair.transcript?.kind === "word" ? linkedPair.transcript.words : [];
  const lines = useMemo(() => groupWordsIntoLines(words), [words]);

  const textStyle: React.CSSProperties = {
    fontFamily: fonts.primary,
    fontWeight: 600,
    fontSize: 50,
    lineHeight,
    letterSpacing: "-0.01em",
    textAlign: "center",
    textShadow: "0 2px 40px rgba(0,0,0,0.6)",
    maxWidth: "100%",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
  };

  const transcript = linkedPair.transcript;

  const units: CaptionUnit[] = useMemo(() => {
    if (!transcript) return [];

    if (transcript.kind === "block") {
      return transcript.blocks
        .filter((b) => b.text.trim().length > 0 && b.startMs <= MAX_MS)
        .map((b) => ({
          text: b.text,
          startMs: b.startMs,
          startFrame: toFrame(b.startMs, fps, trimStartSeconds),
          endFrame: toFrame(b.endMs, fps, trimStartSeconds),
        }))
        .filter((b): b is typeof b & { startFrame: number } => b.startFrame !== null)
        .filter((b) => frame >= b.startFrame && frame <= (b.endFrame ?? b.startFrame))
        .sort((a, b) => a.startMs - b.startMs)
        .map((b, i) => ({
          key: `${b.startMs}-${i}`,
          startFrame: b.startFrame,
          endFrame: b.endFrame ?? b.startFrame,
          text: b.text,
        }));
    }

    const linesWithFrames = lines.map((line) =>
      line
        .map((w) => ({
          word: w.word,
          startMs: w.startMs,
          startFrame: toFrame(w.startMs, fps, trimStartSeconds),
          endFrame: toFrame(w.endMs, fps, trimStartSeconds),
        }))
        .filter(
          (w): w is typeof w & { startFrame: number } => w.startFrame !== null && w.startMs <= MAX_MS
        )
    );

    const activeLine = linesWithFrames.find((line) => {
      if (line.length === 0) return false;
      const start = Math.min(...line.map((w) => w.startFrame));
      const end = Math.max(...line.map((w) => w.endFrame ?? w.startFrame));
      return frame >= start && frame <= end;
    });

    if (!activeLine) return [];

    return [
      {
        key: `${activeLine[0].startMs}`,
        startFrame: Math.min(...activeLine.map((w) => w.startFrame)),
        endFrame: Math.max(...activeLine.map((w) => w.endFrame ?? w.startFrame)),
        text: activeLine.map((w) => w.word).join(" "),
        words: activeLine.map((w) => ({
          word: w.word,
          startFrame: w.startFrame,
          endFrame: w.endFrame ?? w.startFrame,
        })),
      },
    ];
  }, [transcript, lines, fps, trimStartSeconds, frame]);

  if (units.length === 0) return null;

  return (
    <AbsoluteFill style={containerStyle}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {units.map((unit) => (
          <CaptionUnitView
            key={unit.key}
            unit={unit}
            captionStyle={linkedPair.captionStyle}
            frame={frame}
            fps={fps}
            textStyle={textStyle}
            textColor={textColor}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
