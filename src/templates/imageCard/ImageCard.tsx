import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { WordReveal } from "../shared/WordReveal";
import { getFontsForLanguage } from "../shared/language";
import type { VideoProps } from "../schema";
import { sampleBackgroundBrightness } from "../shared/sampleBrightness";
import { getContrastAdjustment } from "../shared/autoContrast";
import { getImageEffectStyle } from "../shared/imageEffects";

type Look = { text: string; font: string; size: number; weight: number; upper: boolean; scrim: string };

export const imageCardVariants = [
  { id: "frost",    label: "Frost",    colors: { bg: "#060609", text: "#FFFFFF"  } },
  { id: "warm",     label: "Warm",     colors: { bg: "#180A02", text: "#FFF3E6"  } },
  { id: "bold",     label: "Bold",     colors: { bg: "#000000", text: "#FFFFFF"  } },
  { id: "midnight", label: "Midnight", colors: { bg: "#080418", text: "#E8E0FF"  } },
  { id: "ember",    label: "Ember",    colors: { bg: "#1C0800", text: "#FFE4C0"  } },
  { id: "steel",    label: "Steel",    colors: { bg: "#040C18", text: "#E0EEFF"  } },
  { id: "verdant",  label: "Verdant",  colors: { bg: "#021008", text: "#C8FFD8"  } },
  { id: "none",     label: "None",     colors: { bg: "#0B0B10", text: "#FFFFFF"  } },
];

export const ImageCard: React.FC<VideoProps> = ({
  text,
  backgroundSrc,
  variant,
  language = "en",
  layerMode = "full",
  textColorOverride = null,
  imageEffect = "zoom-in",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const isNone = variant === "none";
  const fonts = getFontsForLanguage(language);

  const LOOKS: Record<string, Look> = {
    frost: {
      text: "#FFFFFF",  font: fonts.primary, size: 52,  weight: 600, upper: false,
      scrim: "linear-gradient(to top, rgba(6,6,9,0.92) 6%, rgba(6,6,9,0.35) 42%, rgba(6,6,9,0) 70%)",
    },
    warm: {
      text: "#FFF3E6",  font: fonts.primary, size: 52,  weight: 600, upper: false,
      scrim: "linear-gradient(to top, rgba(24,10,2,0.92) 6%, rgba(24,10,2,0.35) 42%, rgba(24,10,2,0) 70%)",
    },
    bold: {
      text: "#FFFFFF",  font: fonts.bold,    size: 88,  weight: 400, upper: true,
      scrim: "linear-gradient(to top, rgba(0,0,0,0.94) 8%, rgba(0,0,0,0.45) 46%, rgba(0,0,0,0) 72%)",
    },
    midnight: {
      text: "#E8E0FF",  font: fonts.display, size: 52,  weight: 500, upper: false,
      scrim: "linear-gradient(to top, rgba(8,4,24,0.94) 6%, rgba(8,4,24,0.40) 44%, rgba(8,4,24,0) 72%)",
    },
    ember: {
      text: "#FFE4C0",  font: fonts.primary, size: 52,  weight: 600, upper: false,
      scrim: "linear-gradient(to top, rgba(28,8,0,0.94) 6%, rgba(28,8,0,0.40) 44%, rgba(28,8,0,0) 72%)",
    },
    steel: {
      text: "#E0EEFF",  font: fonts.primary, size: 52,  weight: 600, upper: false,
      scrim: "linear-gradient(to top, rgba(4,12,24,0.94) 6%, rgba(4,12,24,0.40) 44%, rgba(4,12,24,0) 72%)",
    },
    verdant: {
      text: "#C8FFD8",  font: fonts.primary, size: 52,  weight: 600, upper: false,
      scrim: "linear-gradient(to top, rgba(2,16,8,0.94) 6%, rgba(2,16,8,0.40) 44%, rgba(2,16,8,0) 72%)",
    },
  };

  const look = LOOKS[variant] ?? LOOKS.frost;

  const [brightness, setBrightness] = useState(0.4);
  useEffect(() => {
    if (!backgroundSrc) { setBrightness(0.4); return; }
    sampleBackgroundBrightness(backgroundSrc).then(setBrightness);
  }, [backgroundSrc]);

  const adjustment = backgroundSrc ? getContrastAdjustment(brightness) : { textColor: look.text, overlayOpacity: 1.0 };
  const textColor = textColorOverride ?? adjustment.textColor;
  const extraOpacity = backgroundSrc ? Math.min(0.25, Math.max(0, (adjustment.overlayOpacity - 1.0) * 0.25)) : 0;

  const effectStyle = getImageEffectStyle(imageEffect, frame, durationInFrames);
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  const lineHeight = look.upper
    ? (language === "te" ? 1.08 : 0.98)
    : (language === "te" ? 1.24 : 1.14);

  const isGreenscreen = layerMode === "greenscreen";
  const showText = layerMode !== "background-only";

  return (
    <AbsoluteFill style={{ backgroundColor: isGreenscreen ? "#00FF00" : "#0b0b10" }}>
      {!isGreenscreen && (
        <>
          <AbsoluteFill
            style={{
              transform: effectStyle.transform,
              filter: effectStyle.filter,
              opacity: effectStyle.opacity ?? 1,
              transformOrigin: "center center",
            }}
          >
            {backgroundSrc ? (
              <Img src={backgroundSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <AbsoluteFill style={{ background: "linear-gradient(160deg, #3a2f5e, #15161f)" }} />
            )}
          </AbsoluteFill>

          {!isNone && <AbsoluteFill style={{ background: look.scrim }} />}
          {!isNone && extraOpacity > 0 && (
            <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${extraOpacity.toFixed(3)})`, pointerEvents: "none" }} />
          )}
        </>
      )}

      {showText && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 320,
            opacity: fadeOut,
          }}
        >
          <WordReveal
            text={text}
            color={textColor}
            fontFamily={look.font}
            fontSize={look.size}
            fontWeight={look.weight}
            uppercase={look.upper}
            lineHeight={lineHeight}
            letterSpacing={look.upper ? "0.01em" : "-0.02em"}
            shadow
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
