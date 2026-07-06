import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type DataDashboardProps = { children: React.ReactNode; width: number; height: number };

const ACCENT = "#00D4FF";

function stableSceneNumber(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return (Math.abs(hash) % 20) + 1;
}

type CornerConfig = {
  vAnchor: "top" | "bottom";
  hAnchor: "left" | "right";
};

const CORNERS: CornerConfig[] = [
  { vAnchor: "top", hAnchor: "left" },
  { vAnchor: "top", hAnchor: "right" },
  { vAnchor: "bottom", hAnchor: "left" },
  { vAnchor: "bottom", hAnchor: "right" },
];

// HUD-style targeting frame: full-canvas content with corner brackets, live
// data readouts, thin accent guide lines, a bottom progress bar, and a
// slow vertical scan line sweep — all overlaid with pointerEvents none.
export const DataDashboard: React.FC<DataDashboardProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const instanceId = React.useId();
  const sceneNumber = stableSceneNumber(instanceId);

  const bracketProgress = spring({ frame, fps, config: { damping: 12 } });
  const bracketSize = width * 0.06;
  const inset = width * 0.04;

  const mm = Math.floor(frame / fps / 60);
  const ss = Math.floor(frame / fps) % 60;
  const ff = frame % Math.round(fps);
  const timecode = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;

  const progressWidth = interpolate(frame, [0, Math.max(durationInFrames, 1)], [0, width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scanY = ((frame % 90) / 90) * height;

  const readoutStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily: "monospace",
    fontSize: 18,
    color: ACCENT,
    opacity: 0.8,
    letterSpacing: "0.05em",
  };

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", clipPath: "inset(0px)" }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>

      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {/* Corner brackets */}
        {CORNERS.map((c, i) => {
          const vStyle = c.vAnchor === "top" ? { top: inset } : { bottom: inset };
          const hStyle = c.hAnchor === "left" ? { left: inset } : { right: inset };
          const originX = c.hAnchor === "left" ? "left" : "right";
          const originY = c.vAnchor === "top" ? "top" : "bottom";
          return (
            <div key={i} style={{ position: "absolute", ...vStyle, ...hStyle, width: bracketSize, height: bracketSize }}>
              <div
                style={{
                  position: "absolute",
                  ...(c.vAnchor === "top" ? { top: 0 } : { bottom: 0 }),
                  ...(c.hAnchor === "left" ? { left: 0 } : { right: 0 }),
                  width: bracketSize,
                  height: 3,
                  backgroundColor: ACCENT,
                  transform: `scaleX(${bracketProgress})`,
                  transformOrigin: `${originX} center`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  ...(c.vAnchor === "top" ? { top: 0 } : { bottom: 0 }),
                  ...(c.hAnchor === "left" ? { left: 0 } : { right: 0 }),
                  width: 3,
                  height: bracketSize,
                  backgroundColor: ACCENT,
                  transform: `scaleY(${bracketProgress})`,
                  transformOrigin: `center ${originY}`,
                }}
              />
            </div>
          );
        })}

        {/* Corner readouts */}
        <div style={{ ...readoutStyle, top: inset + bracketSize + 6, left: inset }}>
          SC {String(sceneNumber).padStart(2, "0")}
        </div>
        <div style={{ ...readoutStyle, top: inset + bracketSize + 6, right: inset }}>{timecode}</div>
        <div style={{ ...readoutStyle, bottom: inset + bracketSize + 6, left: inset }}>1080×1920</div>
        <div style={{ ...readoutStyle, bottom: inset + bracketSize + 6, right: inset }}>30 FPS</div>

        {/* Accent guide lines */}
        <div style={{ position: "absolute", top: height * 0.06, left: 0, right: 0, height: 1, backgroundColor: ACCENT, opacity: 0.2 }} />
        <div style={{ position: "absolute", top: height * 0.94, left: 0, right: 0, height: 1, backgroundColor: ACCENT, opacity: 0.2 }} />
        <div style={{ position: "absolute", left: width * 0.04, top: 0, bottom: 0, width: 1, backgroundColor: ACCENT, opacity: 0.2 }} />
        <div style={{ position: "absolute", right: width * 0.04, top: 0, bottom: 0, width: 1, backgroundColor: ACCENT, opacity: 0.2 }} />

        {/* Progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: progressWidth, background: `linear-gradient(90deg, ${ACCENT}, #7B5CF0)` }} />

        {/* Scan line sweep */}
        <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: 2, backgroundColor: ACCENT, opacity: 0.15 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
