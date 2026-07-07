import React from "react";
import type { FrameId } from "./types";
import { MinimalBezel } from "./components/MinimalBezel";
import { SquareBezel } from "./components/SquareBezel";
import { LandscapeBezel } from "./components/LandscapeBezel";
import { BrowserWindow } from "./components/BrowserWindow";
import { GradientBorder } from "./components/GradientBorder";
import { NeonGlow } from "./components/NeonGlow";
import { FilmStrip } from "./components/FilmStrip";
import { Polaroid } from "./components/Polaroid";
import { DarkSpotlight } from "./components/DarkSpotlight";
import { CinematicScope } from "./components/CinematicScope";
import { TvFrame } from "./components/TvFrame";
import { FloatingDevice } from "./components/FloatingDevice";
import { NeonSign } from "./components/NeonSign";
import { ArchPortal } from "./components/ArchPortal";
import { VintageProjector } from "./components/VintageProjector";
import { StickyNote } from "./components/StickyNote";
import { SplitScreen } from "./components/SplitScreen";
import { TerminalFrame } from "./components/TerminalFrame";
import { DataDashboard } from "./components/DataDashboard";
import { BreakingNews } from "./components/BreakingNews";
import { PhoneNotification } from "./components/PhoneNotification";
import { HologramFrame } from "./components/HologramFrame";
import { MorphingShape } from "./components/MorphingShape";
import { WaveformBorder } from "./components/WaveformBorder";
import { IPhoneDepth } from "./components/IPhoneDepth";
import { FrostedGlass } from "./components/FrostedGlass";

export function wrapInFrame(
  frameId: FrameId,
  width: number,
  height: number,
  children: React.ReactNode,
  frameGreenScreen?: boolean
): React.ReactElement {
  if (frameId === "minimal-bezel") {
    return (
      <MinimalBezel width={width} height={height} bgColor={frameGreenScreen ? "#00FF00" : undefined}>
        {children}
      </MinimalBezel>
    );
  }
  if (frameId === "square-bezel") {
    return (
      <SquareBezel width={width} height={height} bgColor={frameGreenScreen ? "#00FF00" : undefined}>
        {children}
      </SquareBezel>
    );
  }
  if (frameId === "landscape-bezel") {
    return (
      <LandscapeBezel width={width} height={height} bgColor={frameGreenScreen ? "#00FF00" : undefined}>
        {children}
      </LandscapeBezel>
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
  if (frameId === "floating-device") {
    return (
      <FloatingDevice width={width} height={height} bgColor={frameGreenScreen ? "#00FF00" : undefined}>
        {children}
      </FloatingDevice>
    );
  }
  if (frameId === "neon-sign") {
    return (
      <NeonSign width={width} height={height}>
        {children}
      </NeonSign>
    );
  }
  if (frameId === "arch-portal") {
    return (
      <ArchPortal width={width} height={height}>
        {children}
      </ArchPortal>
    );
  }
  if (frameId === "vintage-projector") {
    return (
      <VintageProjector width={width} height={height}>
        {children}
      </VintageProjector>
    );
  }
  if (frameId === "sticky-note") {
    return (
      <StickyNote width={width} height={height}>
        {children}
      </StickyNote>
    );
  }
  if (frameId === "split-screen") {
    return (
      <SplitScreen width={width} height={height}>
        {children}
      </SplitScreen>
    );
  }
  if (frameId === "terminal") {
    return (
      <TerminalFrame width={width} height={height}>
        {children}
      </TerminalFrame>
    );
  }
  if (frameId === "data-dashboard") {
    return (
      <DataDashboard width={width} height={height}>
        {children}
      </DataDashboard>
    );
  }
  if (frameId === "breaking-news") {
    return (
      <BreakingNews width={width} height={height}>
        {children}
      </BreakingNews>
    );
  }
  if (frameId === "phone-notification") {
    return (
      <PhoneNotification width={width} height={height}>
        {children}
      </PhoneNotification>
    );
  }
  if (frameId === "hologram") {
    return (
      <HologramFrame width={width} height={height}>
        {children}
      </HologramFrame>
    );
  }
  if (frameId === "morphing-shape") {
    return (
      <MorphingShape width={width} height={height}>
        {children}
      </MorphingShape>
    );
  }
  if (frameId === "waveform-border") {
    return (
      <WaveformBorder width={width} height={height}>
        {children}
      </WaveformBorder>
    );
  }
  if (frameId === "iphone-depth") {
    return (
      <IPhoneDepth width={width} height={height}>
        {children}
      </IPhoneDepth>
    );
  }
  if (frameId === "frosted-glass") {
    return (
      <FrostedGlass width={width} height={height}>
        {children}
      </FrostedGlass>
    );
  }
  return <>{children}</>;
}
