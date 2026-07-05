import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type VintageProjectorProps = { children: React.ReactNode; width: number; height: number };

const PARTICLE_COUNT = 12;

// Deterministic per-particle traits derived purely from index — no
// Math.random() — so renders stay reproducible across frames/machines.
function particleTraits(i: number) {
  return {
    baseX: (((i * 97) % 100) / 100),
    baseY: (((i * 53) % 100) / 100),
    speedX: 0.02 + (i % 5) * 0.01,
    offsetX: i * 0.7,
    driftRadius: 8 + (i % 4) * 6,
    fallSpeed: 0.3 + (i % 3) * 0.15,
    size: 2 + (i % 3),
    opacity: 0.4 + ((i % 4) / 4) * 0.3,
  };
}

// Persistent overlay above full-canvas content: constant vignette, drifting
// dust, and a barely-visible brightness flicker, plus a fixed keystone warp
// on the content wrapper for a projected-film feel.
export const VintageProjector: React.FC<VintageProjectorProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();

  const flickerOpacity = Math.sin(frame * 1.1) * Math.sin(frame * 2.3) * 0.025 + 0.01;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          clipPath: "inset(0px)",
          transform: "perspective(2000px) rotateX(0.4deg) rotateY(0.3deg)",
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 0%, transparent 60%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
          const t = particleTraits(i);
          const x = t.baseX * width + Math.sin(frame * t.speedX + t.offsetX) * t.driftRadius;
          const y = (t.baseY * height + frame * t.fallSpeed) % height;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: t.size,
                height: t.size,
                borderRadius: "50%",
                backgroundColor: `rgba(255,255,255,${t.opacity})`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundColor: `rgba(255,255,255,${flickerOpacity})`,
        }}
      />
    </AbsoluteFill>
  );
};
