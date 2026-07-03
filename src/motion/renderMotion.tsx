import React from "react";
import type { ActiveMotion, MotionId } from "./types";
import { ProgressBar } from "./components/ProgressBar";
import { NumberCounter } from "./components/NumberCounter";
import { Countdown } from "./components/Countdown";
import { Ticker } from "./components/Ticker";
import { StepBadge } from "./components/StepBadge";

const MOTION_COMPONENTS: Record<MotionId, React.FC<{ config: any }>> = {
  "progress-bar": ProgressBar,
  "number-counter": NumberCounter,
  countdown: Countdown,
  ticker: Ticker,
  "step-badge": StepBadge,
};

// Bars/badges pinned to the frame edges first, expressive centerpiece effects on top.
const STACK_ORDER: MotionId[] = ["progress-bar", "ticker", "step-badge", "number-counter", "countdown"];

export function RenderMotion({ motion }: { motion: ActiveMotion[] }): React.ReactElement {
  const active = new Map(motion.map((m) => [m.id, m]));
  return (
    <>
      {STACK_ORDER.filter((id) => active.has(id)).map((id) => {
        const Component = MOTION_COMPONENTS[id];
        const item = active.get(id)!;
        return <Component key={id} config={item.config} />;
      })}
    </>
  );
}
