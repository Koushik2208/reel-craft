export type FrameId =
  | "none"
  | "minimal-bezel"
  | "browser-window"
  | "gradient-border"
  | "neon-glow"
  | "film-strip"
  | "polaroid"
  | "dark-spotlight"
  | "cinematic-scope"
  | "tv-frame"
  | "floating-device";

export type Frame = { id: FrameId; label: string; description: string };

// Adding a frame = one entry here + one component. Nothing else changes.
export const FRAMES: Frame[] = [
  { id: "none", label: "No Frame", description: "Raw scene, no device" },
  { id: "minimal-bezel", label: "Minimal Bezel", description: "Clean device, any content" },
  { id: "browser-window", label: "Browser Window", description: "Desktop browser chrome" },
  { id: "gradient-border", label: "Gradient Border", description: "Glowing pink→purple→cyan ring" },
  { id: "neon-glow", label: "Neon Glow", description: "Electric cyan border with outer glow" },
  { id: "film-strip", label: "Film Strip", description: "Sprocket holes on left and right edges" },
  { id: "polaroid", label: "Polaroid", description: "Classic white border with thick bottom" },
  { id: "dark-spotlight", label: "Dark Spotlight", description: "Oval spotlight, dramatic dark surround" },
  { id: "cinematic-scope", label: "Cinematic Scope", description: "Anamorphic 2.39:1 letterbox bars" },
  { id: "tv-frame", label: "TV Frame", description: "Retro CRT television shell" },
  { id: "floating-device", label: "Floating Device", description: "Phone floating on solid background" },
];
