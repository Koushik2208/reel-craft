import { interpolate, spring } from "remotion";
import { FPS } from "./timing";

export const IMAGE_EFFECT_IDS = [
  "none",
  "zoom-in",
  "zoom-out",
  "pan-left",
  "pan-right",
  "pan-up",
  "pan-down",
  "ken-burns",
  "slide-in",
  "scale-pop",
  "sway",
] as const;

export type ImageEffect = (typeof IMAGE_EFFECT_IDS)[number];

export const IMAGE_EFFECT_LABELS: Record<ImageEffect, string> = {
  none: "None",
  "zoom-in": "Zoom In",
  "zoom-out": "Zoom Out",
  "pan-left": "Pan Left",
  "pan-right": "Pan Right",
  "pan-up": "Pan Up",
  "pan-down": "Pan Down",
  "ken-burns": "Ken Burns",
  "slide-in": "Slide In",
  "scale-pop": "Scale Pop",
  sway: "Sway",
};

export type ImageEffectStyle = {
  transform: string;
  filter?: string;
  opacity?: number;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Pan effects hold a constant 1.2x scale so there's always 20% of extra
// content on every side to reveal as the frame translates, regardless of the
// source image's aspect ratio.
const PAN_SCALE = 1.2;

export function getImageEffectStyle(
  effect: ImageEffect,
  frame: number,
  durationInFrames: number
): ImageEffectStyle {
  switch (effect) {
    case "none":
      return { transform: "none" };

    case "zoom-in": {
      const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.15], CLAMP);
      return { transform: `scale(${scale})` };
    }

    case "zoom-out": {
      const scale = interpolate(frame, [0, durationInFrames], [1.15, 1.0], CLAMP);
      return { transform: `scale(${scale})` };
    }

    case "pan-left": {
      const x = interpolate(frame, [0, durationInFrames], [5, -5], CLAMP);
      return { transform: `scale(${PAN_SCALE}) translateX(${x}%)` };
    }

    case "pan-right": {
      const x = interpolate(frame, [0, durationInFrames], [-5, 5], CLAMP);
      return { transform: `scale(${PAN_SCALE}) translateX(${x}%)` };
    }

    case "pan-up": {
      const y = interpolate(frame, [0, durationInFrames], [5, -5], CLAMP);
      return { transform: `scale(${PAN_SCALE}) translateY(${y}%)` };
    }

    case "pan-down": {
      const y = interpolate(frame, [0, durationInFrames], [-5, 5], CLAMP);
      return { transform: `scale(${PAN_SCALE}) translateY(${y}%)` };
    }

    case "ken-burns": {
      const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.2], CLAMP);
      const x = interpolate(frame, [0, durationInFrames], [-3, 3], CLAMP);
      const y = interpolate(frame, [0, durationInFrames], [-3, 3], CLAMP);
      return { transform: `scale(${scale}) translateX(${x}%) translateY(${y}%)` };
    }

    case "slide-in": {
      const introFrames = Math.max(1, durationInFrames * 0.25);
      const progress = spring({
        frame,
        fps: FPS,
        durationInFrames: introFrames,
        config: { mass: 1, damping: 12 },
      });
      const y = interpolate(progress, [0, 1], [100, 0], CLAMP);
      return { transform: `translateY(${y}%)` };
    }

    case "scale-pop": {
      const introFrames = Math.max(1, durationInFrames * 0.2);
      const progress = spring({
        frame,
        fps: FPS,
        durationInFrames: introFrames,
        config: { mass: 1, damping: 10 },
      });
      const scale = interpolate(progress, [0, 1], [0.8, 1.0], CLAMP);
      return { transform: `scale(${scale})` };
    }

    case "sway": {
      const period = 4 * FPS;
      const phase = (frame / period) * Math.PI * 2;
      const angle = Math.sin(phase) * 0.5;
      const x = Math.sin(phase) * 1;
      return { transform: `rotate(${angle}deg) translateX(${x}%)` };
    }
  }
}
