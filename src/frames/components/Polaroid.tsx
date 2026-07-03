import React from "react";

export type PolaroidProps = { children: React.ReactNode; width: number; height: number };

// Border thickness anchored to a 1080x1920 reference: ~32px thin sides/top,
// ~346px thick bottom.
export const Polaroid: React.FC<PolaroidProps> = ({ children, width, height }) => {
  const sideThickness = width * 0.03;
  const bottomThickness = height * 0.18;
  const innerWidth = width - sideThickness * 2;
  const innerHeight = height - sideThickness - bottomThickness;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FFFFFF",
        boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
        transform: "rotate(-1.5deg)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: sideThickness,
          top: sideThickness,
          width: innerWidth,
          height: innerHeight,
          overflow: "hidden",
          clipPath: "inset(0px)",
        }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${innerWidth / width}, ${innerHeight / height})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
