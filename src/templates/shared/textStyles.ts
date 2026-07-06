import {
  inter,
  playfair,
  bebas,
  fraunces,
  baloo2,
  cormorantGaramond,
  italiana,
  dmSans,
  montserrat,
  oswald,
  caveat,
  dancingScript,
} from "./fonts";

export type AnimationKind =
  | "fade-elegant"
  | "reveal-mask"
  | "blur-resolve"
  | "ghost"
  | "letter-expand"
  | "line-by-line"
  | "underline-wipe"
  | "split-reveal"
  | "karaoke-highlight"
  | "word-stamp"
  | "typewriter"
  | "neon-pulse"
  | "sentence-block"
  | "word-cascade"
  | "glitch-reveal"
  | "drop-cap";

export const CAPTION_POSITIONS = ["top", "center", "bottom"] as const;
export type CaptionPosition = (typeof CAPTION_POSITIONS)[number];

export const TEXT_STYLE_IDS = [
  "cinema",
  "editorial",
  "impact",
  "minimal",
  "neon",
  "handwritten",
  "luxury",
  "street",
  "soft",
  "cinematic-title",
  "condensed",
  "dancing",
  "karaoke",
  "stamp",
  "typewriter",
  "neon-pulse",
  "sentence-block",
  "cascade",
  "glitch",
  "drop-cap",
] as const;

export type TextStyle = (typeof TEXT_STYLE_IDS)[number];

export type TextStyleConfig = {
  id: TextStyle;
  label: string;
  /** short 1-2 word tagline shown on the style picker card */
  description: string;
  animation: AnimationKind;
  fontFamily: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontSize: number;
  letterSpacing: string;
  /** overrides the renderer's default word spacing (0.2em) for styles that need more room between words */
  wordSpacing?: string;
  textTransform?: "uppercase" | "lowercase" | "none";
  opacity?: number;
  position: CaptionPosition;
};

// Each style is a complete typographic identity: font, weight, size,
// spacing, and animation are chosen together so picking a style alone
// produces a finished look.
export const TEXT_STYLES: TextStyleConfig[] = [
  {
    id: "cinema",
    label: "Cinéma",
    description: "film · light",
    animation: "reveal-mask",
    fontFamily: cormorantGaramond,
    fontWeight: 300,
    fontSize: 58,
    letterSpacing: "0.12em",
    textTransform: "lowercase",
    position: "bottom",
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "serif · classic",
    animation: "fade-elegant",
    fontFamily: playfair,
    fontWeight: 400,
    fontSize: 52,
    letterSpacing: "0.04em",
    wordSpacing: "0.35em",
    position: "center",
  },
  {
    id: "impact",
    label: "Impact",
    description: "bold · shout",
    animation: "line-by-line",
    fontFamily: bebas,
    fontWeight: 400,
    fontSize: 88,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    position: "bottom",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "quiet · thin",
    animation: "ghost",
    fontFamily: inter,
    fontWeight: 300,
    fontSize: 38,
    letterSpacing: "0.05em",
    opacity: 0.6,
    position: "bottom",
  },
  {
    id: "neon",
    label: "Neon",
    description: "glow · bold",
    animation: "blur-resolve",
    fontFamily: dmSans,
    fontWeight: 700,
    fontSize: 56,
    letterSpacing: "0.06em",
    position: "center",
  },
  {
    id: "handwritten",
    label: "Handwritten",
    description: "script · warm",
    animation: "underline-wipe",
    fontFamily: caveat,
    fontWeight: 400,
    fontSize: 62,
    letterSpacing: "0.03em",
    position: "bottom",
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "wide · elegant",
    animation: "letter-expand",
    fontFamily: italiana,
    fontWeight: 400,
    fontSize: 64,
    letterSpacing: "0.18em",
    position: "center",
  },
  {
    id: "street",
    label: "Street",
    description: "urban · heavy",
    animation: "split-reveal",
    fontFamily: montserrat,
    fontWeight: 900,
    fontSize: 72,
    letterSpacing: "0.01em",
    textTransform: "uppercase",
    position: "bottom",
  },
  {
    id: "soft",
    label: "Soft",
    description: "gentle · light",
    animation: "fade-elegant",
    fontFamily: dmSans,
    fontWeight: 300,
    fontSize: 44,
    letterSpacing: "0.04em",
    wordSpacing: "0.35em",
    opacity: 0.85,
    position: "bottom",
  },
  {
    id: "cinematic-title",
    label: "Cinematic Title",
    description: "epic · bold",
    animation: "blur-resolve",
    fontFamily: fraunces,
    fontWeight: 700,
    fontSize: 76,
    letterSpacing: "0.05em",
    position: "center",
  },
  {
    id: "condensed",
    label: "Condensed",
    description: "tight · clean",
    animation: "reveal-mask",
    fontFamily: oswald,
    fontWeight: 400,
    fontSize: 60,
    letterSpacing: "0.04em",
    position: "bottom",
  },
  {
    id: "dancing",
    label: "Dancing",
    description: "cursive · soft",
    animation: "fade-elegant",
    fontFamily: dancingScript,
    fontWeight: 400,
    fontSize: 66,
    letterSpacing: "0.04em",
    wordSpacing: "0.35em",
    position: "center",
  },
  {
    id: "karaoke",
    label: "Karaoke",
    description: "sing · along",
    animation: "karaoke-highlight",
    fontFamily: dmSans,
    fontWeight: 700,
    fontSize: 52,
    letterSpacing: "0.02em",
    position: "center",
  },
  {
    id: "stamp",
    label: "Word Stamp",
    description: "bold · punch",
    animation: "word-stamp",
    fontFamily: montserrat,
    fontWeight: 900,
    fontSize: 80,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
    position: "center",
  },
  {
    id: "typewriter",
    label: "Typewriter",
    description: "type · click",
    animation: "typewriter",
    // monospace system font, no Google font needed
    fontFamily: "Courier New",
    fontWeight: 400,
    fontSize: 44,
    letterSpacing: "0.05em",
    position: "center",
  },
  {
    id: "neon-pulse",
    label: "Neon Pulse",
    description: "glow · pulse",
    animation: "neon-pulse",
    fontFamily: "Outfit",
    fontWeight: 700,
    fontSize: 56,
    letterSpacing: "0.04em",
    position: "center",
  },
  {
    id: "sentence-block",
    label: "Sentence Block",
    description: "color · blocks",
    animation: "sentence-block",
    fontFamily: inter,
    fontWeight: 600,
    fontSize: 48,
    letterSpacing: "0.01em",
    position: "center",
  },
  {
    id: "cascade",
    label: "Color Cascade",
    description: "rainbow · flow",
    animation: "word-cascade",
    fontFamily: fraunces,
    fontWeight: 700,
    fontSize: 56,
    letterSpacing: "0.02em",
    position: "center",
  },
  {
    id: "glitch",
    label: "Glitch",
    description: "rgb · shift",
    animation: "glitch-reveal",
    fontFamily: bebas,
    fontWeight: 400,
    fontSize: 80,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    position: "center",
  },
  {
    id: "drop-cap",
    label: "Drop Cap",
    description: "editorial · large",
    animation: "drop-cap",
    fontFamily: cormorantGaramond,
    fontWeight: 300,
    fontSize: 48,
    letterSpacing: "0.04em",
    position: "center",
  },
];

export const TEXT_STYLE_LABELS: Record<TextStyle, string> = Object.fromEntries(
  TEXT_STYLES.map((s) => [s.id, s.label])
) as Record<TextStyle, string>;

export const DEFAULT_TEXT_STYLE: TextStyle = "editorial";

function getTextStyleConfig(id: TextStyle): TextStyleConfig {
  return (
    TEXT_STYLES.find((s) => s.id === id) ??
    TEXT_STYLES.find((s) => s.id === DEFAULT_TEXT_STYLE)!
  );
}

// The 12 general-purpose fonts available for the font override picker.
// Tiro Telugu / Ramabhadra are excluded — those stay reserved as the
// language-driven fallback (see getFontsForLanguage) rather than being
// user-selectable style fonts.
export const STYLE_FONTS: { family: string; label: string }[] = [
  { family: inter, label: "Inter" },
  { family: playfair, label: "Playfair Display" },
  { family: bebas, label: "Bebas Neue" },
  { family: baloo2, label: "Baloo 2" },
  { family: cormorantGaramond, label: "Cormorant Garamond" },
  { family: fraunces, label: "Fraunces" },
  { family: italiana, label: "Italiana" },
  { family: dmSans, label: "DM Sans" },
  { family: montserrat, label: "Montserrat" },
  { family: oswald, label: "Oswald" },
  { family: caveat, label: "Caveat" },
  { family: dancingScript, label: "Dancing Script" },
];

// Which weights each font actually ships, so the weight override control
// can hide options a font can't render.
export const FONT_SUPPORTED_WEIGHTS: Record<string, number[]> = {
  [inter]: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  [playfair]: [400, 500, 600, 700, 800, 900],
  [bebas]: [400],
  [baloo2]: [400, 500, 600, 700, 800],
  [cormorantGaramond]: [300, 400, 500, 600, 700],
  [fraunces]: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  [italiana]: [400],
  [dmSans]: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  [montserrat]: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  [oswald]: [200, 300, 400, 500, 600, 700],
  [caveat]: [400, 500, 600, 700],
  [dancingScript]: [400, 500, 600, 700],
};

export type ResolvedTextStyleProps = {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  letterSpacing: string;
  wordSpacing?: string;
  textTransform?: "uppercase" | "lowercase" | "none";
  opacity?: number;
  captionPosition: CaptionPosition;
  animation: AnimationKind;
};

export type TextStyleOverrides = {
  fontOverride: string | null;
  fontWeightOverride: number | null;
  fontSizeOverride: number | null;
  captionPosition: CaptionPosition | null;
};

// Merges a style's baked-in typographic identity with whichever fields the
// user has explicitly overridden. `null` in an override means "use the
// style's default" for that field.
export function resolveTextStyleProps(
  textStyle: TextStyle,
  overrides: TextStyleOverrides
): ResolvedTextStyleProps {
  const config = getTextStyleConfig(textStyle);
  return {
    fontFamily: overrides.fontOverride ?? config.fontFamily,
    fontWeight: overrides.fontWeightOverride ?? config.fontWeight,
    fontSize: overrides.fontSizeOverride ?? config.fontSize,
    letterSpacing: config.letterSpacing,
    wordSpacing: config.wordSpacing,
    textTransform: config.textTransform,
    opacity: config.opacity,
    captionPosition: overrides.captionPosition ?? config.position,
    animation: config.animation,
  };
}
