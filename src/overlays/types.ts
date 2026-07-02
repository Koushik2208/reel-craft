export type OverlayId =
  | "crt-scanlines"
  | "vhs"
  | "light-leak"
  | "film-dust"
  | "noise"
  | "glow-bloom"
  | "speed-lines"
  | "halftone"
  | "halation"
  | "grid";

export type OverlayIntensity = "low" | "medium" | "high";

export type ActiveOverlay = {
  id: OverlayId;
  intensity: OverlayIntensity;
};

export type OverlayMeta = {
  id: OverlayId;
  label: string;
  description: string;
  hasIntensity: boolean;
};

// Adding an overlay = one entry here + one component + one line in renderOverlays.tsx.
export const OVERLAYS: OverlayMeta[] = [
  { id: "crt-scanlines", label: "CRT Scanlines", description: "Horizontal scan line grid", hasIntensity: true },
  { id: "vhs", label: "VHS", description: "Tape distortion + color fringe", hasIntensity: false },
  { id: "light-leak", label: "Light Leak", description: "Animated color bleed across frame", hasIntensity: true },
  { id: "film-dust", label: "Film Dust", description: "Random grain particles", hasIntensity: false },
  { id: "noise", label: "Noise", description: "Animated feTurbulence texture", hasIntensity: true },
  { id: "glow-bloom", label: "Glow Bloom", description: "Radial color glow spread", hasIntensity: true },
  { id: "speed-lines", label: "Speed Lines", description: "Radial lines from center", hasIntensity: false },
  { id: "halftone", label: "Halftone", description: "Dot pattern overlay", hasIntensity: true },
  { id: "halation", label: "Halation", description: "Soft bloom bleed around brights", hasIntensity: true },
  { id: "grid", label: "Grid", description: "Subtle flat digital grid", hasIntensity: true },
];
