import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type PhoneNotificationProps = { children: React.ReactNode; width: number; height: number };

// Lock screen with a notification card that slides down at scene start and
// clips the scene content inside its rounded body.
export const PhoneNotification: React.FC<PhoneNotificationProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideProgress = spring({ frame, fps, config: { damping: 14, mass: 0.9 } });
  const slideY = interpolate(slideProgress, [0, 1], [-120, 0]);

  const cardWidth = width * 0.88;
  const cardLeft = (width - cardWidth) / 2;
  const cardTop = height * 0.3;
  const cardPadding = 20;
  const headerHeight = 44;
  const contentHeight = height * 0.55;
  const contentRadius = 12;

  const swipeFloat = Math.sin(frame / 40) * 4;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A1A" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(123,92,240,0.15) 0%, transparent 60%), linear-gradient(180deg, #0A0A1A 0%, #1A0A2E 100%)",
        }}
      />

      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
          {[6, 9, 12].map((h, i) => (
            <div key={i} style={{ width: 4, height: h, backgroundColor: "#FFFFFF" }} />
          ))}
          <span style={{ color: "#FFFFFF", fontSize: 18, marginLeft: 6 }}>5G</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#FFFFFF", fontSize: 18 }}>87%</span>
          <div style={{ width: 24, height: 12, border: "1.5px solid #FFFFFF", borderRadius: 3, position: "relative" }}>
            <div style={{ position: "absolute", right: -4, top: 3, width: 2, height: 6, backgroundColor: "#FFFFFF" }} />
          </div>
        </div>
      </div>

      {/* Time / date */}
      <div style={{ position: "absolute", top: height * 0.05, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ color: "#FFFFFF", fontWeight: 300, fontSize: height * 0.15, lineHeight: 1 }}>10:24</div>
        <div style={{ color: "#FFFFFF", fontWeight: 300, fontSize: height * 0.025, marginTop: 8 }}>
          Monday, July 7
        </div>
      </div>

      {/* Notification card */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: cardWidth,
          backgroundColor: "rgba(30,30,40,0.92)",
          borderRadius: 20,
          padding: cardPadding,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          transform: `translateY(${slideY}%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", height: headerHeight }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #7B5CF0, #FF3D9A)",
            }}
          />
          <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 13, marginLeft: 10 }}>Reel Craft</span>
          <span style={{ color: "#858585", fontSize: 13, marginLeft: "auto" }}>now</span>
        </div>
        <div
          style={{
            marginTop: 12,
            width: "100%",
            height: contentHeight,
            overflow: "hidden",
            clipPath: `inset(0px round ${contentRadius}px)`,
            borderRadius: contentRadius,
          }}
        >
          <AbsoluteFill>{children}</AbsoluteFill>
        </div>
      </div>

      {/* Swipe hint */}
      <div
        style={{
          position: "absolute",
          bottom: height * 0.06,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#FFFFFF",
          opacity: 0.4,
          fontSize: 20,
          transform: `translateY(${swipeFloat}px)`,
        }}
      >
        Swipe up to unlock
      </div>
    </AbsoluteFill>
  );
};
