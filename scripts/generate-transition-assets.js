#!/usr/bin/env node
// scripts/generate-transition-assets.js
//
// Bakes the clapperboard stripe bar into a static raster PNG under
// public/transitions/. A live CSS `repeating-linear-gradient` renders fine
// in @remotion/player and the CLI renderer, but the in-browser WebCodecs
// web-renderer draws it as a single non-repeating gradient (confirmed by
// visual inspection of an actual export) — it doesn't tile the repeat.
// Baking the full-size stripe pattern as one PNG sidesteps any "repeat"
// semantics entirely: it's just one image, drawn once, no tiling logic
// required from the renderer.
//
// Re-run this script if WIDTH/HEIGHT (src/templates/shared/timing.ts) or
// the stripe geometry in src/transitions/ClapperboardTransition.tsx changes.

import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "transitions");
mkdirSync(OUT_DIR, { recursive: true });

const WIDTH = 1080;
// Taller than the 52%-of-1920 bar (~998px) actually needs, so the <Img>
// covers it fully at any minor rounding without needing to be exact.
const BAR_HEIGHT = 1040;
const BAND = 20; // px per color band -> 40px period, matching the original gradient

function drawStripes() {
  const canvas = createCanvas(WIDTH, BAR_HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, BAR_HEIGHT);

  // Diagonal bands at -45deg: draw a series of parallel white bars wide
  // enough to cover the canvas once rotated, spaced one full period (40px)
  // apart, over a black base — same look as
  // repeating-linear-gradient(-45deg, #000 0 20px, #fff 20px 40px).
  ctx.save();
  ctx.translate(WIDTH / 2, BAR_HEIGHT / 2);
  ctx.rotate((-45 * Math.PI) / 180);
  ctx.fillStyle = "#ffffff";

  const diagonal = Math.sqrt(WIDTH * WIDTH + BAR_HEIGHT * BAR_HEIGHT);
  const period = BAND * 2;
  const start = -diagonal;
  const end = diagonal;
  for (let x = start; x < end; x += period) {
    ctx.fillRect(x, -diagonal, BAND, diagonal * 2);
  }
  ctx.restore();

  return canvas.toBuffer("image/png");
}

writeFileSync(join(OUT_DIR, "clapperboard-stripes.png"), drawStripes());

console.log(`Wrote transition assets to ${OUT_DIR}`);
