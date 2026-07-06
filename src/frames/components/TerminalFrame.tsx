import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type TerminalFrameProps = { children: React.ReactNode; width: number; height: number };

const FILENAMES = ["index.py", "scene.md", "main.ts", "app.js", "notes.txt"] as const;

// Stable per-mounted-instance pick (not per-frame) so each scene in a
// timeline reads as its own "file" without needing a scene-index prop.
function stableIndex(id: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % mod;
}

const DOT_COLORS = ["#FF5F56", "#FFBD2E", "#27C93F"];

// VS Code-style editor shell: title bar with traffic lights, a single active
// tab, a scrolling line-number gutter, and a blue status bar. The content
// area is the clipped window the scene renders into.
export const TerminalFrame: React.FC<TerminalFrameProps> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const instanceId = React.useId();
  const filename = FILENAMES[stableIndex(instanceId, FILENAMES.length)];

  const outerRadius = width * 0.02;
  const titleBarHeight = 48;
  const tabBarHeight = 36;
  const gutterWidth = 48;
  const statusBarHeight = 28;

  const contentTop = titleBarHeight + tabBarHeight;
  const contentLeft = gutterWidth;
  const contentWidth = width - gutterWidth;
  const contentHeight = height - contentTop - statusBarHeight;

  const lineHeight = 32;
  const gutterBlockHeight = lineHeight * 20;
  const gutterOffset = -((frame * 0.5) % gutterBlockHeight);

  const cursorVisible = Math.floor(frame / 20) % 2 === 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1E1E1E", borderRadius: outerRadius, overflow: "hidden" }}>
      {/* Title bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: titleBarHeight,
          backgroundColor: "#2D2D2D",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {DOT_COLORS.map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c }} />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#CCCCCC",
            fontSize: 15,
            fontFamily: "monospace",
            pointerEvents: "none",
          }}
        >
          {filename}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <div style={{ width: 12, height: 2, backgroundColor: "#858585" }} />
          <div style={{ width: 12, height: 12, border: "2px solid #858585" }} />
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          position: "absolute",
          top: titleBarHeight,
          left: 0,
          right: 0,
          height: tabBarHeight,
          backgroundColor: "#252526",
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            padding: "0 20px",
            backgroundColor: "#1E1E1E",
            color: "#FFFFFF",
            fontSize: 14,
            fontFamily: "monospace",
            borderTop: "2px solid #7B5CF0",
          }}
        >
          {filename}
        </div>
      </div>

      {/* Line number gutter */}
      <div
        style={{
          position: "absolute",
          top: contentTop,
          left: 0,
          width: gutterWidth,
          height: contentHeight,
          backgroundColor: "#1E1E1E",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: gutterOffset, left: 0, right: 0 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              style={{
                height: lineHeight,
                lineHeight: `${lineHeight}px`,
                textAlign: "right",
                paddingRight: 12,
                color: "#858585",
                fontSize: 20,
                fontFamily: "monospace",
              }}
            >
              {(i % 20) + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          position: "absolute",
          top: contentTop,
          left: contentLeft,
          width: contentWidth,
          height: contentHeight,
          overflow: "hidden",
          clipPath: "inset(0px)",
          backgroundColor: "#1E1E1E",
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            width: 2,
            height: 24,
            backgroundColor: "#569CD6",
            opacity: cursorVisible ? 1 : 0,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: statusBarHeight,
          backgroundColor: "#007ACC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
        }}
      >
        <span style={{ color: "#FFFFFF", fontSize: 11, fontFamily: "monospace" }}>● main</span>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ color: "#FFFFFF", fontSize: 11, fontFamily: "monospace" }}>Python</span>
          <span style={{ color: "#FFFFFF", fontSize: 11, fontFamily: "monospace" }}>UTF-8</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
