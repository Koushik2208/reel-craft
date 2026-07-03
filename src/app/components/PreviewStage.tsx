import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import { useStore, sceneDurationInFrames, linkedDurationInFrames } from "../store";
import { usePreviewMode } from "../PreviewContext";
import { SceneSeries, totalDurationInFrames } from "./SceneSeries";
import { VideoComposition } from "./VideoComposition";
import { LinkedComposition } from "./LinkedComposition";
import { FPS, WIDTH, HEIGHT } from "../../templates/shared/timing";

const frameShellClass =
  "relative h-full overflow-hidden rounded-[28px] border border-rim bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]";
const stageClass =
  "relative mx-auto h-[60vh] max-h-[60vh] w-auto max-w-full lg:h-[min(640px,calc(100vh-200px))] lg:max-h-none lg:w-auto lg:max-w-[360px]";

const SafeAreaOverlay: React.FC = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-x-0 top-0 h-[14%] bg-accent-purple/10 border-b border-accent-purple/30" />
    <div className="absolute inset-x-0 bottom-0 h-[18%] bg-accent-purple/10 border-t border-accent-purple/30" />
    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-wide text-accent-purple/80">
      keep text out of the shaded zones
    </span>
  </div>
);

const LinkedPreview: React.FC<{ showSafeArea: boolean }> = ({ showSafeArea }) => {
  const { linkedPair, finishes } = useStore();
  const canPreview = !!linkedPair?.audio?.src;
  const durationInFrames = useMemo(
    () => (canPreview ? Math.max(linkedDurationInFrames(linkedPair!), 1) : 1),
    [canPreview, linkedPair]
  );
  const inputProps = useMemo(
    () => ({ linkedPair: linkedPair!, finishes }),
    [linkedPair, finishes]
  );

  return (
    <div className={stageClass} style={{ aspectRatio: "9 / 16" }}>
      <div className={frameShellClass}>
        {canPreview ? (
          <Player
            key="linked"
            component={LinkedComposition}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            fps={FPS}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            style={{ width: "100%", height: "100%" }}
            controls
            loop
            autoPlay
            acknowledgeRemotionLicense
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-[13px] leading-snug text-muted">
            Upload audio to preview your linked video.
          </div>
        )}
        {showSafeArea && <SafeAreaOverlay />}
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        {canPreview
          ? `${(durationInFrames / FPS).toFixed(1)}s · 1080×1920 · 9:16`
          : "Linked mode · 1080×1920 · 9:16"}
      </p>
    </div>
  );
};

export const PreviewStage: React.FC<{ showSafeArea: boolean }> = ({ showSafeArea }) => {
  const { scenes, audio, finishes, activeSceneId, projectMode } = useStore();
  const previewMode = usePreviewMode();
  const isSceneMode = previewMode === "scene";
  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0];
  const activeIndex = scenes.findIndex((s) => s.id === activeScene.id);

  const fullDurationInFrames = useMemo(() => Math.max(totalDurationInFrames(scenes), 1), [scenes]);
  const sceneDurInFrames = useMemo(
    () => Math.max(sceneDurationInFrames(activeScene), 1),
    [activeScene]
  );
  const durationInFrames = isSceneMode ? sceneDurInFrames : fullDurationInFrames;

  const fullInputProps = useMemo(() => ({ scenes, audio, finishes }), [scenes, audio, finishes]);
  const sceneInputProps = useMemo(
    () => ({
      text: activeScene.text,
      template: activeScene.template,
      variant: activeScene.variant,
      backgroundSrc: activeScene.asset?.src ?? null,
      language: activeScene.language ?? "en",
      layerMode: activeScene.layerMode ?? "full",
      textColorOverride: activeScene.textColorOverride ?? null,
      frameId: activeScene.frameId ?? "none",
      overlays: activeScene.overlays ?? [],
      imageEffect: activeScene.imageEffect ?? "zoom-in",
    }),
    [activeScene]
  );

  if (projectMode === "linked") {
    return <LinkedPreview showSafeArea={showSafeArea} />;
  }

  return (
    <div className={stageClass} style={{ aspectRatio: "9 / 16" }}>
      <div className={frameShellClass}>
        {isSceneMode ? (
          <Player
            key={`scene-${activeScene.id}`}
            component={VideoComposition}
            inputProps={sceneInputProps}
            durationInFrames={durationInFrames}
            fps={FPS}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            style={{ width: "100%", height: "100%" }}
            controls
            loop
            autoPlay
            acknowledgeRemotionLicense
          />
        ) : (
          <Player
            key="full"
            component={SceneSeries}
            inputProps={fullInputProps}
            durationInFrames={durationInFrames}
            fps={FPS}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            style={{ width: "100%", height: "100%" }}
            controls
            loop
            autoPlay
            acknowledgeRemotionLicense
          />
        )}
        {showSafeArea && <SafeAreaOverlay />}
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        {isSceneMode
          ? `Scene ${activeIndex + 1} of ${scenes.length} · ${(durationInFrames / FPS).toFixed(1)}s · 1080×1920 · 9:16`
          : `${(durationInFrames / FPS).toFixed(1)}s total · ${scenes.length} scene${scenes.length !== 1 ? "s" : ""} · 1080×1920 · 9:16`}
      </p>
    </div>
  );
};
