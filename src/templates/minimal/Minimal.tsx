import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { getFontsForLanguage } from "../shared/language";
import { getImageEffectStyle } from "../shared/imageEffects";
import { TextStyleRenderer } from "../shared/TextStyleRenderer";
import { resolveTextStyleProps } from "../shared/textStyles";
import type { VideoProps } from "../schema";

type Look = { bg: string; text: string };

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
  textStyle = "editorial",
  fontOverride = null,
  fontWeightOverride = null,
  fontSizeOverride = null,
  captionPosition = null,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fonts = getFontsForLanguage(language);
  const effectStyle = getImageEffectStyle(imageEffect, frame, durationInFrames);

  const LOOKS: Record<string, Look> = {
    ink:      { bg: "#0E0F13", text: "#F4F3EE" },
    paper:    { bg: "#FBF7EF", text: "#1C1A17" },
    midnight: { bg: "#0E1525", text: "#EAF0FF" },
    rose:     { bg: "#1A0A0A", text: "#FFD6D6" },
    forest:   { bg: "#071510", text: "#C8F0D8" },
    sand:     { bg: "#F5EFE0", text: "#2C2010" },
    slate:    { bg: "#0D1117", text: "#CDD9E5" },
    gold:     { bg: "#0F0C00", text: "#FFD966" },
  };

  const look = LOOKS[variant] ?? LOOKS.ink;

  // Minimal has no background asset, so "background-only" has nothing to show.
  if (layerMode === "background-only") {
    return <AbsoluteFill />;
  }

  const resolved = resolveTextStyleProps(textStyle, {
    fontOverride,
    fontWeightOverride,
    fontSizeOverride,
    captionPosition,
  });
  // Language takes priority over the style's default font, but not over an
  // explicit user font override.
  const fontFamily = language === "te" && fontOverride === null ? fonts.display : resolved.fontFamily;

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
      <TextStyleRenderer
        text={text}
        textStyle={textStyle}
        durationInFrames={durationInFrames}
        color={textColorOverride ?? look.text}
        fontFamily={fontFamily}
        fontWeight={resolved.fontWeight}
        fontSize={resolved.fontSize}
        letterSpacing={resolved.letterSpacing}
        wordSpacing={resolved.wordSpacing}
        textTransform={resolved.textTransform}
        opacity={resolved.opacity}
        captionPosition={resolved.captionPosition}
      />
    </AbsoluteFill>
  );
};
