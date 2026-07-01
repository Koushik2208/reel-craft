import React from "react";
import { AbsoluteFill } from "remotion";

export type BrowserWindowProps = { children: React.ReactNode; width: number; height: number };

// Top bar height anchored to a 1920px-tall reference (~60px).
export const BrowserWindow: React.FC<BrowserWindowProps> = ({ children, width, height }) => {
  const barHeight = (height * 60) / 1920;
  const contentHeight = height - barHeight;
  const dotSize = barHeight * 0.26;

  return (
    <AbsoluteFill style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: "#1E1E28",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: dotSize * 0.7, marginLeft: width * 0.025 }}>
          <span style={{ width: dotSize, height: dotSize, borderRadius: "50%", backgroundColor: "#FF5F57" }} />
          <span style={{ width: dotSize, height: dotSize, borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
          <span style={{ width: dotSize, height: dotSize, borderRadius: "50%", backgroundColor: "#28C840" }} />
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#252535",
            borderRadius: 9999,
            padding: `${barHeight * 0.18}px ${width * 0.035}px`,
            color: "#8B8BA0",
            fontSize: barHeight * 0.34,
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          }}
        >
          reelcraft.app
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: barHeight,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(1, ${contentHeight / height})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
