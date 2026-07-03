import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { type CinematicFinishes, type LinkedPair } from "../store";
import { TEMPLATES } from "../../templates/registry";
import { wrapInFrame } from "../../frames/wrapInFrame";
import { RenderOverlays } from "../../overlays/renderOverlays";
import { RenderMotion } from "../../motion/renderMotion";
import { WIDTH, HEIGHT } from "../../templates/shared/timing";
import { getAudioVolumeAtFrame } from "../../templates/shared/audioFade";
import { LinkedCaptions } from "./LinkedCaptions";
import { GrainOverlay, VignetteOverlay, LetterboxOverlay } from "./CinematicFinishes";

export type LinkedCompositionProps = {
  linkedPair: NonNullable<LinkedPair>;
  finishes?: CinematicFinishes;
};

// Mirrors VideoComposition's shape (template + frame + overlays), but the
// template only ever supplies the background — captions come from
// LinkedCaptions instead of the template's own WordReveal, so the template
// is always driven with "background-only" or "greenscreen", never "full".
export const LinkedComposition: React.FC<LinkedCompositionProps> = ({ linkedPair, finishes }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const meta = TEMPLATES[linkedPair.template] ?? TEMPLATES.minimal;
  const Template = meta.component;
  const audio = linkedPair.audio;
  const trimBefore = audio ? Math.round(audio.trimStartSeconds * fps) : 0;
  const layerMode = linkedPair.layerMode ?? "full";
  const showCaptions = layerMode !== "background-only";
  // Grain/vignette/letterbox would dirty the green and make keying harder.
  const skipFinishes = layerMode === "greenscreen";

  const content = (
    <AbsoluteFill style={{ overflow: "hidden", clipPath: "inset(0px)" }}>
      <Template
        text=" "
        backgroundSrc={linkedPair.background?.src ?? null}
        variant={linkedPair.variant}
        language={linkedPair.language}
        layerMode={layerMode === "greenscreen" ? "greenscreen" : "background-only"}
        textColorOverride={linkedPair.textColorOverride}
        imageEffect={linkedPair.imageEffect ?? "zoom-in"}
      />
      {showCaptions && <LinkedCaptions linkedPair={linkedPair} />}
      {!skipFinishes && finishes?.vignette && <VignetteOverlay />}
      {!skipFinishes && finishes?.grain && <GrainOverlay />}
      {!skipFinishes && finishes?.letterbox && <LetterboxOverlay />}
      <RenderOverlays overlays={linkedPair.overlays} />
      <RenderMotion motion={linkedPair.motion} />
    </AbsoluteFill>
  );

  return (
    <>
      {wrapInFrame(linkedPair.frameId, WIDTH, HEIGHT, content)}
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
