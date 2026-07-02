import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { OverlayIntensity } from "../types";
import { WIDTH, HEIGHT } from "../../templates/shared/timing";

const PARTICLE_COUNT = 60;

function makeLcg(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Intensity is ignored — Film Dust is an on/off overlay.
export const FilmDust: React.FC<{ intensity: OverlayIntensity }> = () => {
  const frame = useCurrentFrame();
  const seed = (frame % 3) + 1;
  const rand = makeLcg(seed);

  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    cx: rand() * WIDTH,
    cy: rand() * HEIGHT,
    r: 1 + rand() * 2,
    opacity: 0.6 + rand() * 0.3,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {particles.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="white" opacity={p.opacity} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
