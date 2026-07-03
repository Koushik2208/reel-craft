import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { StepBadgeConfig } from "../types";

const POSITION_STYLE: Record<StepBadgeConfig["position"], React.CSSProperties> = {
  "top-left": { top: 48, left: 24 },
  "top-right": { top: 48, right: 24 },
  "bottom-left": { bottom: 48, left: 24 },
  "bottom-right": { bottom: 48, right: 24 },
};

export const StepBadge: React.FC<{ config: StepBadgeConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...POSITION_STYLE[config.position],
          transform: `scale(${scale})`,
          padding: 2,
          borderRadius: 999,
          background: "linear-gradient(135deg, #FF3D9A, #7B5CF0)",
        }}
      >
        <div
          style={{
            borderRadius: 999,
            background: "rgba(0,0,0,0.75)",
            padding: "8px 18px",
            fontSize: 14,
            fontWeight: 600,
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          Step {config.stepNumber} / {config.totalSteps}
        </div>
      </div>
    </AbsoluteFill>
  );
};
