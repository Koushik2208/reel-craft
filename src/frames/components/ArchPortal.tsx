import React, { useId } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type ArchPortalProps = { children: React.ReactNode; width: number; height: number };

// Content is visible only through an arch-shaped SVG clip: a rectangle
// bottom half topped by a semicircle, centered near the bottom of canvas.
export const ArchPortal: React.FC<ArchPortalProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const clipId = `arch-clip-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const archWidth = width * 0.78;
  const archLeft = (width - archWidth) / 2;
  const archRight = archLeft + archWidth;
  const radius = archWidth / 2;
  const rectHeight = height * 0.55;
  const archBottom = height * 0.92;
  const archTop = archBottom - rectHeight - radius;

  const path = `M ${archLeft},${archBottom} L ${archLeft},${archTop} A ${radius},${radius} 0 0,1 ${archRight},${archTop} L ${archRight},${archBottom} Z`;

  const glowOpacity = Math.sin(frame / 60) * 0.08 + 0.15;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0D12" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
      </svg>
      <AbsoluteFill style={{ clipPath: `url(#${clipId})` }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          clipPath: `url(#${clipId})`,
          boxShadow: `inset 0 0 60px 18px rgba(255,255,255,${glowOpacity})`,
        }}
      />
    </AbsoluteFill>
  );
};
