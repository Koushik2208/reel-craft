import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { TickerConfig } from "../types";
import { WIDTH } from "../../templates/shared/timing";

const SPEED_PX_PER_FRAME = 4;
const SEPARATOR = "    •    ";

export const Ticker: React.FC<{ config: TickerConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const loopWidth = WIDTH * 2;
  const offset = (frame * SPEED_PX_PER_FRAME) % loopWidth;
  const translateX = config.direction === "left" ? -offset : offset - loopWidth;

  const block = `${config.text}${SEPARATOR}`;
  const repeated = block.repeat(6);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          [config.position]: 0,
          height: 56,
          background: "rgba(0,0,0,0.6)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            fontSize: 22,
            fontWeight: 600,
            color: "white",
            fontFamily: "sans-serif",
            transform: `translateX(${translateX}px)`,
          }}
        >
          {repeated}
        </div>
      </div>
    </AbsoluteFill>
  );
};
