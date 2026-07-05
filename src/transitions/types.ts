export type TransitionId =
  | "none"
  | "crossfade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "wipe"
  | "clapperboard";

export type TransitionDuration = "short" | "medium" | "long";

// short = 10 frames, medium = 20 frames, long = 30 frames
export const TRANSITION_DURATION_FRAMES: Record<TransitionDuration, number> = {
  short: 10,
  medium: 20,
  long: 30,
};

export type SceneTransition = {
  id: TransitionId;
  duration: TransitionDuration;
};

export const DEFAULT_TRANSITION: SceneTransition = {
  id: "none",
  duration: "medium",
};

export type TransitionMeta = {
  id: TransitionId;
  label: string;
  description: string;
};

// Adding a transition = one entry here + a presentation in getPresentationForTransition. Nothing else changes.
export const TRANSITIONS: TransitionMeta[] = [
  { id: "none", label: "None", description: "Hard cut between scenes" },
  { id: "crossfade", label: "Crossfade", description: "Smooth opacity dissolve" },
  { id: "slide-left", label: "Slide Left", description: "Next scene pushes in from right" },
  { id: "slide-right", label: "Slide Right", description: "Next scene pushes in from left" },
  { id: "slide-up", label: "Slide Up", description: "Next scene pushes in from bottom" },
  { id: "slide-down", label: "Slide Down", description: "Next scene pushes in from top" },
  { id: "wipe", label: "Wipe", description: "Directional clip-path wipe" },
  { id: "clapperboard", label: "Clapperboard", description: "Cinema clap reveal" },
];
