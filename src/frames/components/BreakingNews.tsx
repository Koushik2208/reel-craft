import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export type BreakingNewsProps = { children: React.ReactNode; width: number; height: number };

const RED = "#FF4444";
const TICKER_TEXT = "Stay informed · Breaking updates · More details ahead · ";

// Broadcast news lower-third: top bar with elapsed clock, a pulsing LIVE
// badge, a channel bug, and a bottom lower-third with a scrolling ticker.
export const BreakingNews: React.FC<BreakingNewsProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsedSeconds = Math.floor(frame / fps);
  const mm = Math.floor(elapsedSeconds / 60);
  const ss = elapsedSeconds % 60;
  const clock = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  const livePulse = Math.sin(frame * 0.15) * 0.2 + 0.8;

  const tickerFontSize = 22;
  const unitWidth = TICKER_TEXT.length * tickerFontSize * 0.55;
  const tickerX = -((frame * 2) % unitWidth);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", clipPath: "inset(0px)" }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>

      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <span style={{ color: "#FFFFFF", fontWeight: 700, letterSpacing: "0.15em", fontSize: 20 }}>
            BREAKING NEWS
          </span>
          <div style={{ width: 2, height: 28, backgroundColor: RED, margin: "0 20px" }} />
          <span style={{ color: "#FFFFFF", fontFamily: "monospace", fontSize: 20 }}>{clock}</span>
        </div>

        {/* LIVE badge */}
        <div
          style={{
            position: "absolute",
            top: 72,
            right: 20,
            padding: "6px 16px",
            borderRadius: 999,
            backgroundColor: RED,
            opacity: livePulse,
          }}
        >
          <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 14 }}>● LIVE</span>
        </div>

        {/* Channel bug */}
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 20,
            width: 60,
            height: 60,
            backgroundColor: RED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
          }}
        >
          <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 20 }}>RC</span>
        </div>

        {/* Bottom lower-third */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120 }}>
          <div
            style={{
              height: 40,
              backgroundColor: RED,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
            }}
          >
            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 18 }}>DEVELOPING STORY</span>
          </div>
          <div
            style={{
              height: 80,
              backgroundColor: "rgba(0,0,0,0.9)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                whiteSpace: "nowrap",
                transform: `translateX(${tickerX}px)`,
              }}
            >
              <span style={{ color: "#FFFFFF", fontSize: tickerFontSize }}>{TICKER_TEXT.repeat(3)}</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
