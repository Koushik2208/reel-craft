import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { getFontsForLanguage } from "../shared/language";
import { fraunces } from "../shared/fonts";
import { getImageEffectStyle } from "../shared/imageEffects";
import type { VideoProps } from "../schema";

type Look = { bg: string; text: string; font: string; weight: number; tracking: string };

export const minimalVariants = [
  { id: "ink",      label: "Ink",      colors: { bg: "#0E0F13", text: "#F4F3EE" } },
  { id: "paper",    label: "Paper",    colors: { bg: "#FBF7EF", text: "#1C1A17" } },
  { id: "midnight", label: "Midnight", colors: { bg: "#0E1525", text: "#EAF0FF" } },
  { id: "rose",     label: "Rose",     colors: { bg: "#1A0A0A", text: "#FFD6D6" } },
  { id: "forest",   label: "Forest",   colors: { bg: "#071510", text: "#C8F0D8" } },
  { id: "sand",     label: "Sand",     colors: { bg: "#F5EFE0", text: "#2C2010" } },
  { id: "slate",    label: "Slate",    colors: { bg: "#0D1117", text: "#CDD9E5" } },
  { id: "gold",     label: "Gold",     colors: { bg: "#0F0C00", text: "#FFD966" } },
];

export const Minimal: React.FC<VideoProps> = ({
  text,
  variant,
  language = "en",
  layerMode = "full",
  textColorOverride = null,
  imageEffect = "zoom-in",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fonts = getFontsForLanguage(language);
  const effectStyle = getImageEffectStyle(imageEffect, frame, durationInFrames);
  const frauncesFallback = language === "te" ? fonts.display : fraunces;

  const LOOKS: Record<string, Look> = {
    ink:      { bg: "#0E0F13", text: "#F4F3EE", font: fonts.primary,    weight: 600, tracking: "-0.03em" },
    paper:    { bg: "#FBF7EF", text: "#1C1A17", font: fonts.display,    weight: 500, tracking: "-0.01em" },
    midnight: { bg: "#0E1525", text: "#EAF0FF", font: fonts.primary,    weight: 600, tracking: "-0.03em" },
    rose:     { bg: "#1A0A0A", text: "#FFD6D6", font: frauncesFallback, weight: 500, tracking: "-0.01em" },
    forest:   { bg: "#071510", text: "#C8F0D8", font: fonts.primary,    weight: 600, tracking: "-0.03em" },
    sand:     { bg: "#F5EFE0", text: "#2C2010", font: frauncesFallback, weight: 500, tracking: "-0.01em" },
    slate:    { bg: "#0D1117", text: "#CDD9E5", font: fonts.primary,    weight: 500, tracking: "-0.02em" },
    gold:     { bg: "#0F0C00", text: "#FFD966", font: fonts.display,    weight: 600, tracking: "-0.01em" },
  };

  const look = LOOKS[variant] ?? LOOKS.ink;
  const lineHeight = language === "te" ? 1.28 : 1.18;

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 22, durationInFrames - 4],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const rise = interpolate(frame, [0, 26], [22, 0], { extrapolateRight: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Minimal has no background asset, so "background-only" has nothing to show.
  if (layerMode === "background-only") {
    return <AbsoluteFill />;
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: layerMode === "greenscreen" ? "#00FF00" : look.bg,
          transform: effectStyle.transform,
          filter: effectStyle.filter,
          opacity: effectStyle.opacity ?? 1,
          transformOrigin: "center center",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            opacity,
            transform: `translateY(${rise}px)`,
            maxWidth: "80%",
            textAlign: "center",
            color: textColorOverride ?? look.text,
            fontFamily: look.font,
            fontWeight: look.weight,
            fontSize: 52,
            lineHeight,
            letterSpacing: look.tracking,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
