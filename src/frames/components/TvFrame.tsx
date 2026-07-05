import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export type TvFrameProps = { children: React.ReactNode; width: number; height: number };

const SCANLINES =
  "repeating-linear-gradient(transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)";

// Warm plastic CRT shell. The bezel fills the full canvas; the screen is
// inset within it. A brief power-on ramp (frames 0-8) and a constant, very
// faint phosphor flicker are the only animated touches — everything else
// is a static illusion of depth via gradients and shadows.
export const TvFrame: React.FC<TvFrameProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();

  const outerRadius = width * 0.06;
  const insetX = width * 0.1;
  const insetTopBottom = height * 0.12;
  const screenWidth = width - insetX * 2;
  const screenHeight = height - insetTopBottom * 2;
  const screenRadius = width * 0.03;

  const powerOn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const flicker = Math.sin(frame * 0.8) * 0.015 + 0.04;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: outerRadius,
          backgroundColor: "#1A1510",
          boxShadow: "0 30px 100px rgba(0,0,0,0.95), inset 0 2px 4px rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: outerRadius,
            background: "radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: insetX,
            top: insetTopBottom,
            width: screenWidth,
            height: screenHeight,
            borderRadius: screenRadius,
            overflow: "hidden",
            clipPath: `inset(0px round ${screenRadius}px)`,
            backgroundColor: "#0A0A0A",
          }}
        >
          <AbsoluteFill style={{ opacity: powerOn }}>
            <AbsoluteFill>{children}</AbsoluteFill>
            <AbsoluteFill
              style={{
                pointerEvents: "none",
                background: `radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.15) 100%)`,
              }}
            />
            <AbsoluteFill
              style={{
                pointerEvents: "none",
                backgroundColor: `rgba(255, 220, 100, ${flicker})`,
              }}
            />
            <AbsoluteFill
              style={{
                pointerEvents: "none",
                background: SCANLINES,
              }}
            />
          </AbsoluteFill>
        </div>

        {[0.55, 0.68].map((topFraction, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              right: insetX * 0.35,
              top: height * topFraction,
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#2A2520",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.05)",
              pointerEvents: "none",
            }}
          />
        ))}

        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * 0.42 + i * (width * 0.06),
              bottom: height * 0.02,
              width: width * 0.04,
              height: height * 0.008,
              backgroundColor: "#111111",
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
