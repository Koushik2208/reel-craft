export type MotionId =
  | "progress-bar"
  | "number-counter"
  | "countdown"
  | "ticker"
  | "step-badge"
  | "code-block";

export type ProgressBarConfig = { position: "top" | "bottom" };
export type NumberCounterConfig = { startNumber: number; endNumber: number; prefix: string; suffix: string };
export type CountdownConfig = { startFrom: 3 | 5 | 10 };
export type TickerConfig = { text: string; direction: "left" | "right"; position: "top" | "bottom" };
export type StepBadgeConfig = {
  stepNumber: number;
  totalSteps: number;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};
export type CodeBlockConfig = {
  code: string;
  language: "python" | "sql" | "r" | "bash" | "js";
  position: "top" | "center" | "bottom";
  linesPerPage: number;
};

export type MotionConfig =
  | ProgressBarConfig
  | NumberCounterConfig
  | CountdownConfig
  | TickerConfig
  | StepBadgeConfig
  | CodeBlockConfig;

export type ActiveMotion =
  | { id: "progress-bar"; config: ProgressBarConfig }
  | { id: "number-counter"; config: NumberCounterConfig }
  | { id: "countdown"; config: CountdownConfig }
  | { id: "ticker"; config: TickerConfig }
  | { id: "step-badge"; config: StepBadgeConfig }
  | { id: "code-block"; config: CodeBlockConfig };

export type MotionMeta = {
  id: MotionId;
  label: string;
  description: string;
};

// Adding a motion graphic = one entry here + one component + one line in renderMotion.tsx.
export const MOTION_GRAPHICS: MotionMeta[] = [
  { id: "progress-bar", label: "Progress Bar", description: "Growing bar across the top or bottom" },
  { id: "number-counter", label: "Number Counter", description: "Animated count from start to end" },
  { id: "countdown", label: "Countdown", description: "Big centered countdown numbers" },
  { id: "ticker", label: "Ticker", description: "Scrolling text bar" },
  { id: "step-badge", label: "Step Badge", description: "\"Step X / Y\" pill label" },
  { id: "code-block", label: "Code Block", description: "Syntax highlighted floating code snippet" },
];

// Central defaults so `toggleMotion` (and any future caller) can insert a
// sensible starting config without each store action re-declaring one.
export const MOTION_DEFAULTS: { [K in MotionId]: Extract<ActiveMotion, { id: K }>["config"] } = {
  "progress-bar": { position: "bottom" },
  "number-counter": { startNumber: 0, endNumber: 100, prefix: "", suffix: "" },
  countdown: { startFrom: 3 },
  ticker: { text: "Breaking News", direction: "left", position: "bottom" },
  "step-badge": { stepNumber: 1, totalSteps: 3, position: "top-right" },
  "code-block": {
    code: "import pandas as pd\ndf = pd.read_csv('data.csv')\ndf.head()",
    language: "python",
    position: "center",
    linesPerPage: 8,
  },
};

export function defaultMotionFor(id: MotionId): ActiveMotion {
  return { id, config: MOTION_DEFAULTS[id] } as ActiveMotion;
}
