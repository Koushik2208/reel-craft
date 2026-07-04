import React, { useEffect, useState } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { TextStyleRenderer } from "../shared/TextStyleRenderer";
import { resolveTextStyleProps } from "../shared/textStyles";
import { getFontsForLanguage } from "../shared/language";
import type { VideoProps } from "../schema";
import { sampleBackgroundBrightness } from "../shared/sampleBrightness";
import { getContrastAdjustment, applyOpacityMultiplier } from "../shared/autoContrast";
import { getImageEffectStyle } from "../shared/imageEffects";

type Look = { overlay: string; text: string };

const LOOKS: Record<string, Look> = {
  noir:    { overlay: "rgba(8,8,10,0.62)",   text: "#FFFFFF"  },
  ember:   { overlay: "rgba(28,12,4,0.58)",  text: "#FFEFE0"  },
  cool:    { overlay: "rgba(6,12,26,0.60)",  text: "#EAF1FF"  },
  dusk:    { overlay: "rgba(40,10,30,0.62)", text: "#FFD6F0"  },
  arctic:  { overlay: "rgba(4,18,32,0.65)",  text: "#C8E8FF"  },
  sepia:   { overlay: "rgba(30,18,4,0.60)",  text: "#FFE8C0"  },
  verdant: { overlay: "rgba(4,20,10,0.62)",  text: "#C0FFD4"  },
};

export const cinematicVariants = [
  { id: "noir",    label: "Noir",    colors: { bg: "#08080A", text: "#FFFFFF"  } },
  { id: "ember",   label: "Ember",   colors: { bg: "#1C0C04", text: "#FFEFE0"  } },
  { id: "cool",    label: "Cool",    colors: { bg: "#060C1A", text: "#EAF1FF"  } },
  { id: "dusk",    label: "Dusk",    colors: { bg: "#280A1E", text: "#FFD6F0"  } },
  { id: "arctic",  label: "Arctic",  colors: { bg: "#041220", text: "#C8E8FF"  } },
  { id: "sepia",   label: "Sepia",   colors: { bg: "#1E1204", text: "#FFE8C0"  } },
  { id: "verdant", label: "Verdant", colors: { bg: "#04140A", text: "#C0FFD4"  } },
  { id: "none",    label: "None",    colors: { bg: "#111114", text: "#FFFFFF"  } },
];

export const Cinematic: React.FC<VideoProps> = ({
  text,
  backgroundSrc,
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
  const isNone = variant === "none";
  const look = LOOKS[variant] ?? LOOKS.noir;
  const fonts = getFontsForLanguage(language);

  const [brightness, setBrightness] = useState(0.4);
  useEffect(() => {
    if (!backgroundSrc) { setBrightness(0.4); return; }
    sampleBackgroundBrightness(backgroundSrc).then(setBrightness);
  }, [backgroundSrc]);

  const adjustment = backgroundSrc ? getContrastAdjustment(brightness) : { textColor: look.text, overlayOpacity: 1.0 };
  const textColor = textColorOverride ?? adjustment.textColor;
  const overlayColor = backgroundSrc ? applyOpacityMultiplier(look.overlay, adjustment.overlayOpacity) : look.overlay;

  const effectStyle = getImageEffectStyle(imageEffect, frame, durationInFrames);
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  const isGreenscreen = layerMode === "greenscreen";
  const showText = layerMode !== "background-only";

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
    <AbsoluteFill style={{ backgroundColor: isGreenscreen ? "#00FF00" : "#000" }}>
      {!isGreenscreen && (
        <>
          {backgroundSrc ? (
            <AbsoluteFill
              style={{
                transform: effectStyle.transform,
                filter: effectStyle.filter,
                opacity: effectStyle.opacity ?? 1,
                transformOrigin: "center center",
              }}
            >
              <Video
                src={backgroundSrc}
                muted
                loop
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
          ) : (
            <AbsoluteFill
              style={{
                transform: effectStyle.transform,
                filter: effectStyle.filter,
                opacity: effectStyle.opacity ?? 1,
                transformOrigin: "center center",
                background: "radial-gradient(120% 120% at 50% 20%, #2a2a3a 0%, #0b0b10 70%)",
              }}
            />
          )}

          {!isNone && <AbsoluteFill style={{ backgroundColor: overlayColor }} />}
        </>
      )}

      {showText && (
        <AbsoluteFill style={{ opacity: fadeOut }}>
          <TextStyleRenderer
            text={text}
            textStyle={textStyle}
            durationInFrames={durationInFrames}
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
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
