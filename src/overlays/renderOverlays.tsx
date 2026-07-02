import React from "react";
import type { ActiveOverlay, OverlayId } from "./types";
import { CrtScanlines } from "./components/CrtScanlines";
import { Vhs } from "./components/Vhs";
import { LightLeak } from "./components/LightLeak";
import { FilmDust } from "./components/FilmDust";
import { Noise } from "./components/Noise";
import { GlowBloom } from "./components/GlowBloom";
import { SpeedLines } from "./components/SpeedLines";
import { Halftone } from "./components/Halftone";
import { Halation } from "./components/Halation";
import { Grid } from "./components/Grid";

const OVERLAY_COMPONENTS: Record<OverlayId, React.FC<{ intensity: ActiveOverlay["intensity"] }>> = {
  grid: Grid,
  halftone: Halftone,
  noise: Noise,
  "film-dust": FilmDust,
  "crt-scanlines": CrtScanlines,
  halation: Halation,
  "glow-bloom": GlowBloom,
  "light-leak": LightLeak,
  vhs: Vhs,
  "speed-lines": SpeedLines,
};

// Subtle texture overlays first, expressive effects on top.
const STACK_ORDER: OverlayId[] = [
  "grid",
  "halftone",
  "noise",
  "film-dust",
  "crt-scanlines",
  "halation",
  "glow-bloom",
  "light-leak",
  "vhs",
  "speed-lines",
];

export function RenderOverlays({ overlays }: { overlays: ActiveOverlay[] }): React.ReactElement {
  const active = new Map(overlays.map((o) => [o.id, o]));
  return (
    <>
      {STACK_ORDER.filter((id) => active.has(id)).map((id) => {
        const Component = OVERLAY_COMPONENTS[id];
        const overlay = active.get(id)!;
        return <Component key={id} intensity={overlay.intensity} />;
      })}
    </>
  );
}
