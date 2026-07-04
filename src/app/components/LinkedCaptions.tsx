import React, { useEffect, useMemo, useState } from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { MAX_LINKED_DURATION_SECONDS, type LinkedPair, type WordTimestamp } from "../store";
import { getFontsForLanguage } from "../../templates/shared/language";
import { sampleBackgroundBrightness } from "../../templates/shared/sampleBrightness";
import { getContrastAdjustment } from "../../templates/shared/autoContrast";
import { MAX_CHARS_PER_SCENE } from "../../templates/shared/textSplit";
import { TextStyleRenderer } from "../../templates/shared/TextStyleRenderer";
import { resolveTextStyleProps } from "../../templates/shared/textStyles";

type Props = { linkedPair: NonNullable<LinkedPair> };

type CaptionUnit = {
  key: string;
  startFrame: number;
  endFrame: number;
  text: string;
};

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

  const resolved = resolveTextStyleProps(linkedPair.textStyle, {
    fontOverride: linkedPair.fontOverride,
    fontWeightOverride: linkedPair.fontWeightOverride,
    fontSizeOverride: linkedPair.fontSizeOverride,
    captionPosition: linkedPair.captionPosition,
  });
  // Language takes priority over the style's default font, but not over an
  // explicit user font override.
  const fontFamily =
    linkedPair.language === "te" && linkedPair.fontOverride === null ? fonts.display : resolved.fontFamily;

  const words = linkedPair.transcript?.kind === "word" ? linkedPair.transcript.words : [];
  const lines = useMemo(() => groupWordsIntoLines(words), [words]);

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
      },
    ];
  }, [transcript, lines, fps, trimStartSeconds, frame]);

  if (units.length === 0) return null;

  return (
    <>
      {units.map((unit) => (
        <Sequence
          key={unit.key}
          from={unit.startFrame}
          durationInFrames={Math.max(1, unit.endFrame - unit.startFrame)}
          layout="none"
        >
          <TextStyleRenderer
            text={unit.text}
            textStyle={linkedPair.textStyle}
            durationInFrames={Math.max(1, unit.endFrame - unit.startFrame)}
            color={textColor}
            fontFamily={fontFamily}
            fontWeight={resolved.fontWeight}
            fontSize={resolved.fontSize}
            letterSpacing={resolved.letterSpacing}
            wordSpacing={resolved.wordSpacing}
            textTransform={resolved.textTransform}
            opacity={resolved.opacity}
            captionPosition={resolved.captionPosition}
          />
        </Sequence>
      ))}
    </>
  );
};
