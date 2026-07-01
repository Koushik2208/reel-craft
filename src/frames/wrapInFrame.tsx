import React from "react";
import type { FrameId } from "./types";
import { MinimalBezel } from "./components/MinimalBezel";
import { BrowserWindow } from "./components/BrowserWindow";
import { GradientBorder } from "./components/GradientBorder";
import { NeonGlow } from "./components/NeonGlow";
import { FilmStrip } from "./components/FilmStrip";
import { Polaroid } from "./components/Polaroid";
import { VignetteFrame } from "./components/VignetteFrame";
import { DarkSpotlight } from "./components/DarkSpotlight";
import { CinematicScope } from "./components/CinematicScope";
import { TvFrame } from "./components/TvFrame";

export function wrapInFrame(
  frameId: FrameId,
  width: number,
  height: number,
  children: React.ReactNode
): React.ReactElement {
  if (frameId === "minimal-bezel") {
    return (
      <MinimalBezel width={width} height={height}>
        {children}
      </MinimalBezel>
    );
  }
  if (frameId === "browser-window") {
    return (
      <BrowserWindow width={width} height={height}>
        {children}
      </BrowserWindow>
    );
  }
  if (frameId === "gradient-border") {
    return (
      <GradientBorder width={width} height={height}>
        {children}
      </GradientBorder>
    );
  }
  if (frameId === "neon-glow") {
    return (
      <NeonGlow width={width} height={height}>
        {children}
      </NeonGlow>
    );
  }
  if (frameId === "film-strip") {
    return (
      <FilmStrip width={width} height={height}>
        {children}
      </FilmStrip>
    );
  }
  if (frameId === "polaroid") {
    return (
      <Polaroid width={width} height={height}>
        {children}
      </Polaroid>
    );
  }
  if (frameId === "vignette-frame") {
    return (
      <VignetteFrame width={width} height={height}>
        {children}
      </VignetteFrame>
    );
  }
  if (frameId === "dark-spotlight") {
    return (
      <DarkSpotlight width={width} height={height}>
        {children}
      </DarkSpotlight>
    );
  }
  if (frameId === "cinematic-scope") {
    return (
      <CinematicScope width={width} height={height}>
        {children}
      </CinematicScope>
    );
  }
  if (frameId === "tv-frame") {
    return (
      <TvFrame width={width} height={height}>
        {children}
      </TvFrame>
    );
  }
  return <>{children}</>;
}
