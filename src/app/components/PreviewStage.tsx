import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import { useStore } from "../store";
import { SceneSeries, totalDurationInFrames } from "./SceneSeries";
import { FPS, WIDTH, HEIGHT } from "../../templates/shared/timing";

export const PreviewStage: React.FC<{ showSafeArea: boolean }> = ({ showSafeArea }) => {
  const { scenes, audio, finishes } = useStore();
  const durationInFrames = useMemo(() => Math.max(totalDurationInFrames(scenes), 1), [scenes]);
  const inputProps = useMemo(() => ({ scenes, audio, finishes }), [scenes, audio, finishes]);

  return (
    <div
      className="relative mx-auto h-[60vh] max-h-[60vh] w-auto max-w-full lg:h-[min(640px,calc(100vh-200px))] lg:max-h-none lg:w-auto lg:max-w-[360px]"
      style={{ aspectRatio: "9 / 16" }}
    >
      <div className="relative h-full overflow-hidden rounded-[28px] border border-rim bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
        <Player
          component={SceneSeries}
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
        {showSafeArea && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-[14%] bg-accent-purple/10 border-b border-accent-purple/30" />
            <div className="absolute inset-x-0 bottom-0 h-[18%] bg-accent-purple/10 border-t border-accent-purple/30" />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-wide text-accent-purple/80">
              keep text out of the shaded zones
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        {(durationInFrames / FPS).toFixed(1)}s total · {scenes.length} scene{scenes.length !== 1 ? "s" : ""} · 1080×1920 · 9:16
      </p>
    </div>
  );
};
