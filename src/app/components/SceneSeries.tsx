import React from "react";
import { Audio } from "@remotion/media";
import { useVideoConfig } from "remotion";
import { TransitionSeries, springTiming, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { VideoComposition } from "./VideoComposition";
import { sceneDurationInFrames, type Scene, type ProjectAudio, type CinematicFinishes } from "../store";
import { getAudioVolumeAtFrame } from "../../templates/shared/audioFade";
import { GrainOverlay, VignetteOverlay, LetterboxOverlay } from "./CinematicFinishes";
import { DEFAULT_TRANSITION, TRANSITION_DURATION_FRAMES, type TransitionId } from "../../transitions/types";
import { clapperboardTransition } from "../../transitions/ClapperboardTransition";

export type SceneSeriesProps = { scenes: Scene[]; audio?: ProjectAudio; finishes?: CinematicFinishes };

export function totalDurationInFrames(scenes: Scene[]): number {
  const sceneTotal = scenes.reduce((acc, s) => acc + sceneDurationInFrames(s), 0);
  const transitionTotal = scenes.slice(0, -1).reduce((acc, s) => {
    const t = s.transition ?? DEFAULT_TRANSITION;
    return t.id === "none" ? acc : acc + TRANSITION_DURATION_FRAMES[t.duration];
  }, 0);
  return sceneTotal - transitionTotal;
}

// Adding a transition = one case here + a presentation. Nothing else changes.
function getPresentationForTransition(id: TransitionId): TransitionPresentation<any> {
  switch (id) {
    case "crossfade":
      return fade();
    case "slide-left":
      return slide({ direction: "from-right" });
    case "slide-right":
      return slide({ direction: "from-left" });
    case "slide-up":
      return slide({ direction: "from-bottom" });
    case "slide-down":
      return slide({ direction: "from-top" });
    case "wipe":
      return wipe({ direction: "from-left" });
    case "clapperboard":
      return clapperboardTransition();
    case "none":
    default:
      return fade();
  }
}

export const SceneSeries: React.FC<SceneSeriesProps> = ({ scenes, audio, finishes }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const trimBefore = audio ? Math.round(audio.trimStartSeconds * fps) : 0;

  return (
    <>
      <TransitionSeries>
        {scenes.map((scene, i) => {
          // Grain/vignette/letterbox would dirty the green and make keying harder.
          const skipFinishes = (scene.layerMode ?? "full") === "greenscreen";
          const transition = scene.transition ?? DEFAULT_TRANSITION;
          const hasTransition = i < scenes.length - 1 && transition.id !== "none";

          return (
            <React.Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={sceneDurationInFrames(scene)}>
                <VideoComposition
                  text={scene.text}
                  template={scene.template}
                  variant={scene.variant}
                  backgroundSrc={scene.asset?.src ?? null}
                  language={scene.language ?? "en"}
                  layerMode={scene.layerMode ?? "full"}
                  textColorOverride={scene.textColorOverride ?? null}
                  frameId={scene.frameId ?? "none"}
                  overlays={scene.overlays ?? []}
                  motion={scene.motion ?? []}
                  imageEffect={scene.imageEffect ?? "zoom-in"}
                  textStyle={scene.textStyle ?? "editorial"}
                  fontOverride={scene.fontOverride ?? null}
                  fontWeightOverride={scene.fontWeightOverride ?? null}
                  fontSizeOverride={scene.fontSizeOverride ?? null}
                  captionPosition={scene.captionPosition ?? null}
                >
                  {!skipFinishes && finishes?.vignette && <VignetteOverlay />}
                  {!skipFinishes && finishes?.grain && <GrainOverlay />}
                  {!skipFinishes && finishes?.letterbox && <LetterboxOverlay />}
                </VideoComposition>
              </TransitionSeries.Sequence>

              {hasTransition && (
                <TransitionSeries.Transition
                  presentation={getPresentationForTransition(transition.id)}
                  timing={springTiming({
                    durationInFrames: TRANSITION_DURATION_FRAMES[transition.duration],
                    config: { damping: 200 },
                  })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
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
