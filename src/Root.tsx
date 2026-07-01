import React from "react";
import { Composition } from "remotion";
import { SceneSeries, totalDurationInFrames } from "./app/components/SceneSeries";
import { TEMPLATES } from "./templates/registry";
import { FPS, WIDTH, HEIGHT } from "./templates/shared/timing";
import type { Scene } from "./app/store";
import { GreenScreenScene } from "./frames/GreenScreenScene";

// Default scenes for CLI / Studio. Override via --props or calculateMetadata.
const defaultScenes: Scene[] = [
  {
    id: "scene-1",
    template: "minimal",
    variant: TEMPLATES.minimal.defaultVariant,
    text: "The best ideas feel obvious\nonly after you've had them.",
    asset: null,
    durationMode: "auto",
    language: "en",
    layerMode: "full",
    textColorOverride: null,
    frameId: "none",
  },
  {
    id: "scene-2",
    template: "minimal",
    variant: TEMPLATES.minimal.defaultVariant,
    text: "Ship the thing.",
    asset: null,
    durationMode: "auto",
    language: "en",
    layerMode: "full",
    textColorOverride: null,
    frameId: "none",
  },
];

// Used by `npm run studio` and `npm run render`. The in-browser app is the
// primary path; this exists so you can also render via the rock-solid CLI:
//   npx remotion render src/remotion.ts video out.mp4 --props='{"scenes":[...]}'
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="video"
        component={SceneSeries}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={totalDurationInFrames(defaultScenes)}
        defaultProps={{ scenes: defaultScenes, audio: null, finishes: { grain: false, vignette: false, letterbox: false } }}
        calculateMetadata={({ props }) => ({
          durationInFrames: totalDurationInFrames(props.scenes),
        })}
      />
      <Composition
        id="green-screen-frame"
        component={GreenScreenScene}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={1}
        defaultProps={{ frameId: "minimal-bezel" }}
      />
    </>
  );
};
