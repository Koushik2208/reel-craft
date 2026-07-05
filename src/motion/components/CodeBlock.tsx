import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CodeBlockConfig } from "../types";

const POSITION_STYLE: Record<CodeBlockConfig["position"], React.CSSProperties> = {
  top: { top: "8%" },
  center: { top: "50%", transform: "translateY(-50%)" },
  bottom: { bottom: "8%" },
};

const LANGUAGE_LABEL: Record<CodeBlockConfig["language"], string> = {
  python: "Python",
  sql: "SQL",
  r: "R",
  bash: "Bash",
  js: "JS",
};

const KEYWORDS = [
  "def",
  "import",
  "from",
  "return",
  "if",
  "else",
  "for",
  "in",
  "class",
  "True",
  "False",
  "None",
  "and",
  "or",
  "not",
  "with",
  "as",
];

const TOKEN_PATTERN = new RegExp(
  [
    `#.*$`, // comment (to end of line)
    `"(?:[^"\\\\]|\\\\.)*"`, // double-quoted string
    `'(?:[^'\\\\]|\\\\.)*'`, // single-quoted string
    `\\b(?:${KEYWORDS.join("|")})\\b`, // keywords
    `\\b\\w+(?=\\()`, // function calls
    `\\b\\d+(?:\\.\\d+)?\\b`, // numbers
  ].join("|"),
  "gm"
);

const CodeHighlighter: React.FC<{ code: string }> = ({ code }) => {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(code)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<React.Fragment key={key++}>{code.slice(lastIndex, match.index)}</React.Fragment>);
    }

    const token = match[0];
    let color = "#D4D4D4";
    if (token.startsWith("#")) {
      color = "#6A9955";
    } else if (token.startsWith('"') || token.startsWith("'")) {
      color = "#CE9178";
    } else if (KEYWORDS.includes(token)) {
      color = "#569CD6";
    } else if (/^\d/.test(token)) {
      color = "#B5CEA8";
    } else {
      color = "#DCDCAA";
    }

    nodes.push(
      <span key={key++} style={{ color }}>
        {token}
      </span>
    );
    lastIndex = match.index + token.length;
  }

  if (lastIndex < code.length) {
    nodes.push(<React.Fragment key={key++}>{code.slice(lastIndex)}</React.Fragment>);
  }

  return <>{nodes}</>;
};

export const CodeBlock: React.FC<{ config: CodeBlockConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entryScale = spring({ frame, fps, config: { damping: 14, mass: 0.8 }, durationInFrames: 12 });
  const entryOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = 0.95 + 0.05 * entryScale;
  const opacity = Math.min(entryOpacity, exitOpacity);

  const lines = config.code.split("\n");
  const linesPerPage = Math.max(1, config.linesPerPage);
  const totalPages = Math.max(1, Math.ceil(lines.length / linesPerPage));
  const framesPerPage = Math.max(1, Math.floor(durationInFrames / totalPages));
  const currentPage = Math.min(totalPages - 1, Math.floor(frame / framesPerPage));
  const visibleLines = lines.slice(currentPage * linesPerPage, (currentPage + 1) * linesPerPage);

  const pageStart = currentPage * framesPerPage;
  const pageEnd = currentPage === totalPages - 1 ? durationInFrames : (currentPage + 1) * framesPerPage;
  const pageLength = pageEnd - pageStart;
  const localFrame = frame - pageStart;
  const pageFadeIn = interpolate(localFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pageFadeOut = interpolate(localFrame, [pageLength - 4, pageLength], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pageOpacity = Math.min(pageFadeIn, pageFadeOut);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          width: "88%",
          margin: "0 auto",
          ...POSITION_STYLE[config.position],
          opacity,
          transform:
            config.position === "center"
              ? `translateY(-50%) scale(${scale})`
              : `scale(${scale})`,
          background: "#1E1E1E",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 36,
            background: "#2D2D2D",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {["#FF5F56", "#FFBD2E", "#27C93F"].map((color) => (
              <div
                key={color}
                style={{ width: 10, height: 10, borderRadius: "50%", background: color }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#858585",
              fontFamily: "sans-serif",
            }}
          >
            {LANGUAGE_LABEL[config.language]}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            padding: 16,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            fontSize: 28,
            lineHeight: 1.6,
            color: "#D4D4D4",
            whiteSpace: "pre-wrap",
            opacity: pageOpacity,
          }}
        >
          <CodeHighlighter code={visibleLines.join("\n")} />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 16,
            fontSize: 14,
            fontFamily: "sans-serif",
            color: "#858585",
            opacity: pageOpacity,
          }}
        >
          {currentPage + 1} / {totalPages}
        </div>
      </div>
    </AbsoluteFill>
  );
};
