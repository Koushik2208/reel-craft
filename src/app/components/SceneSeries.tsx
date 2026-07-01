import React from "react";
import { Audio } from "@remotion/media";
import { Series, useVideoConfig } from "remotion";
import { VideoComposition } from "./VideoComposition";
import { sceneDurationInFrames, type Scene, type ProjectAudio, type CinematicFinishes } from "../store";
import { getAudioVolumeAtFrame } from "../../templates/shared/audioFade";
import { GrainOverlay, VignetteOverlay, LetterboxOverlay } from "./CinematicFinishes";

export type SceneSeriesProps = { scenes: Scene[]; audio?: ProjectAudio; finishes?: CinematicFinishes };

export function totalDurationInFrames(scenes: Scene[]): number {
  return scenes.reduce((acc, s) => acc + sceneDurationInFrames(s), 0);
}

export const SceneSeries: React.FC<SceneSeriesProps> = ({ scenes, audio, finishes }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const trimBefore = audio ? Math.round(audio.trimStartSeconds * fps) : 0;

  return (
    <>
      <Series>
        {scenes.map((scene) => {
          // Grain/vignette/letterbox would dirty the green and make keying harder.
          const skipFinishes = (scene.layerMode ?? "full") === "greenscreen";
          return (
            <Series.Sequence key={scene.id} durationInFrames={sceneDurationInFrames(scene)}>
              <VideoComposition
                text={scene.text}
                template={scene.template}
                variant={scene.variant}
                backgroundSrc={scene.asset?.src ?? null}
                language={scene.language ?? "en"}
                layerMode={scene.layerMode ?? "full"}
                textColorOverride={scene.textColorOverride ?? null}
                frameId={scene.frameId ?? "none"}
              >
                {!skipFinishes && finishes?.vignette && <VignetteOverlay />}
                {!skipFinishes && finishes?.grain && <GrainOverlay />}
                {!skipFinishes && finishes?.letterbox && <LetterboxOverlay />}
              </VideoComposition>
            </Series.Sequence>
          );
        })}
      </Series>
      {audio?.src && (
        <Audio
          src={audio.src}
          trimBefore={trimBefore}
          volume={(f) =>
            getAudioVolumeAtFrame(f, durationInFrames, fps, audio.fadeInSeconds, audio.fadeOutSeconds)
          }
        />
      )}
    </>
  );
};
