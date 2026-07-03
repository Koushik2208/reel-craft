export const TEXT_STYLE_IDS = [
  "fade-elegant",
  "reveal-mask",
  "blur-resolve",
  "ghost",
  "letter-expand",
  "line-by-line",
  "underline-wipe",
  "split-reveal",
] as const;

export type TextStyle = (typeof TEXT_STYLE_IDS)[number];

export const TEXT_STYLE_LABELS: Record<TextStyle, string> = {
  "fade-elegant": "Fade Elegant",
  "reveal-mask": "Reveal Mask",
  "blur-resolve": "Blur Resolve",
  ghost: "Ghost",
  "letter-expand": "Letter Expand",
  "line-by-line": "Line by Line",
  "underline-wipe": "Underline Wipe",
  "split-reveal": "Split Reveal",
};

export const DEFAULT_TEXT_STYLE: TextStyle = "fade-elegant";
