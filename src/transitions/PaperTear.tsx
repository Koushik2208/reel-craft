import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

export type PaperTearProps = Record<string, never>;

const SEGMENTS = 12;
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Deterministic jagged tear line across the canvas width, centered on
// `baseline` — no Math.random() so the shape is identical on every render.
function tearPoints(width: number, baseline: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const x = (width / SEGMENTS) * i;
    const y = baseline + Math.sin(i * 2.3 + i * i * 0.4) * 60;
    points.push({ x, y });
  }
  return points;
}

function topRegionClipPath(points: { x: number; y: number }[], width: number): string {
  const reversed = [...points].reverse();
  const path = reversed.map((p) => `${p.x}px ${p.y}px`).join(", ");
  return `polygon(0px 0px, ${width}px 0px, ${path})`;
}

function bottomRegionClipPath(points: { x: number; y: number }[], width: number, height: number): string {
  const path = points.map((p) => `${p.x}px ${p.y}px`).join(", ");
  return `polygon(${path}, ${width}px ${height}px, 0px ${height}px)`;
}

// The entering scene is the base layer, visible at full opacity from frame
// 0 — it's already "underneath", waiting to be revealed. The exiting scene
// sits on top as a torn sheet of paper: it's split along the jagged line
// into a top and bottom fragment, and as progress goes 0 → 1 the two
// fragments slide apart (up and down) to reveal the entering scene below.
const PaperTearPresentation: React.FC<TransitionPresentationComponentProps<PaperTearProps>> = ({
  children,
  presentationProgress,
  presentationDirection,
}) => {
  const { width, height } = useVideoConfig();

  if (presentationDirection === "entering") {
    return <AbsoluteFill style={{ zIndex: 0 }}>{children}</AbsoluteFill>;
  }

  const points = useMemo(() => tearPoints(width, height / 2), [width, height]);
  const topPath = useMemo(() => topRegionClipPath(points, width), [points, width]);
  const bottomPath = useMemo(() => bottomRegionClipPath(points, width, height), [points, width, height]);

  const topY = interpolate(presentationProgress, [0, 1], [0, -110], clampOpts);
  const bottomY = interpolate(presentationProgress, [0, 1], [0, 110], clampOpts);
  // A brief pulse of darkening right at the start — like the paper straining
  // just before it gives way.
  const stressOpacity = interpolate(presentationProgress, [0, 0.05, 0.1], [0, 0.6, 0], clampOpts);

  // The fragments only visibly move once the transition is actually in
  // progress. At rest (progress 0, i.e. for the rest of the scene before or
  // after the transition window) they sit perfectly joined with zero gap —
  // so the tear-edge stroke and shadow must stay hidden then too, or they'd
  // show up as a permanent scar across the whole scene.
  const isTearing = presentationProgress > 0 && presentationProgress < 1;

  const tearLine = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <AbsoluteFill style={{ zIndex: 2 }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${topY}%)`,
          filter: isTearing ? "drop-shadow(0px 8px 10px rgba(0,0,0,0.45))" : undefined,
        }}
      >
        <AbsoluteFill style={{ clipPath: topPath }}>{children}</AbsoluteFill>
        {isTearing && (
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <polyline points={tearLine} fill="none" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.9} />
          </svg>
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          transform: `translateY(${bottomY}%)`,
          filter: isTearing ? "drop-shadow(0px -8px 10px rgba(0,0,0,0.45))" : undefined,
        }}
      >
        <AbsoluteFill style={{ clipPath: bottomPath }}>{children}</AbsoluteFill>
        {isTearing && (
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <polyline points={tearLine} fill="none" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.9} />
          </svg>
        )}
      </AbsoluteFill>

      {isTearing && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <polyline points={tearLine} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={6} opacity={stressOpacity} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

export const paperTear = (): TransitionPresentation<PaperTearProps> => ({
  component: PaperTearPresentation,
  props: {},
});
