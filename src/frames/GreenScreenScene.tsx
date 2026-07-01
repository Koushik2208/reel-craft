import React from "react";
import { AbsoluteFill } from "remotion";
import { WIDTH, HEIGHT } from "../templates/shared/timing";
import type { FrameId } from "./types";
import { wrapInFrame } from "./wrapInFrame";

export type GreenScreenSceneProps = { frameId: FrameId };

// Used only for the frame-shell PNG export: the device frame with a solid
// green hole where the scene content would go. No text, no background asset.
export const GreenScreenScene: React.FC<GreenScreenSceneProps> = ({ frameId }) => {
  const content = <AbsoluteFill style={{ backgroundColor: "#00FF00" }} />;
  return wrapInFrame(frameId, WIDTH, HEIGHT, content);
};
