import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type SplitScreenProps = { children: React.ReactNode; width: number; height: number };

const GAP = 3;

type PanelEntrance = { axis: "x" | "y"; from: number };

const ENTRANCES: PanelEntrance[] = [
  { axis: "x", from: -100 }, // left panel: slides in from the left
  { axis: "y", from: -100 }, // center panel: slides in from the top
  { axis: "x", from: 100 }, // right panel: slides in from the right
];

// Three vertical panels each clip a different horizontal slice of the same
// full-width content, so together they reconstruct it split across thirds.
export const SplitScreen: React.FC<SplitScreenProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });

  const panelWidth = (width - GAP * 2) / 3;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0D12" }}>
      {ENTRANCES.map((entrance, i) => {
        const panelLeft = i * (panelWidth + GAP);
        const contentOffsetPercent = -(panelLeft / width) * 100;
        const entranceValue = interpolate(progress, [0, 1], [entrance.from, 0]);
        const entranceTransform =
          entrance.axis === "x" ? `translateX(${entranceValue}%)` : `translateY(${entranceValue}%)`;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: panelLeft,
              top: 0,
              width: panelWidth,
              height,
              overflow: "hidden",
              clipPath: "inset(0px)",
              borderRight: i < ENTRANCES.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined,
              transform: entranceTransform,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width,
                height,
                transform: `translateX(${contentOffsetPercent}%)`,
              }}
            >
              <AbsoluteFill>{children}</AbsoluteFill>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
