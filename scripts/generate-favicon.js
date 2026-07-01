#!/usr/bin/env node
// scripts/generate-favicon.js
// Generates Reel Craft favicon assets:
//   public/favicon-32.png   (32×32)
//   public/favicon-64.png   (64×64)
//   public/apple-touch-icon.png (180×180)

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

// Ensure public/ exists
mkdirSync(PUBLIC_DIR, { recursive: true });

/**
 * Draw the Reel Craft icon at the given pixel size.
 * @param {number} size - Canvas size in pixels
 * @returns {Buffer} PNG buffer
 */
function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const radius = size * 0.13; // border-radius ~8px at 64px ≈ 12.5%

  // ── 1. Dark rounded-square background ──────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = '#161620';
  ctx.fill();

  // Clip everything that follows to the rounded square
  ctx.save();
  ctx.clip();

  // ── 2. Diagonal gradient arc / streak ──────────────────────────────────────
  // A sweeping gradient band from top-left to bottom-right
  const grad = ctx.createLinearGradient(
    size * 0.05, size * 0.05,  // start: top-left
    size * 0.95, size * 0.95   // end:   bottom-right
  );
  grad.addColorStop(0, '#FF3D9A');
  grad.addColorStop(1, '#7B5CF0');

  // Draw a thick diagonal arc as the motion accent
  ctx.save();
  ctx.translate(size * 0.5, size * 0.5);
  ctx.rotate(Math.PI * -0.25); // tilt 45° counter-clockwise

  const arcRadius = size * 0.38;
  const arcThickness = size * 0.22;

  ctx.beginPath();
  ctx.arc(0, 0, arcRadius + arcThickness / 2, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.arc(0, 0, arcRadius - arcThickness / 2, Math.PI * 0.55, -Math.PI * 0.55, true);
  ctx.closePath();

  ctx.globalAlpha = 0.72;
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // ── 3. Bold "R" centred ────────────────────────────────────────────────────
  const fontSize = Math.round(size * 0.56);
  ctx.globalAlpha = 1;
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Slight optical nudge: move the R a hair right and up for visual centering
  ctx.fillText('R', size * 0.515, size * 0.515);

  ctx.restore(); // release clip
  return canvas.toBuffer('image/png');
}

const sizes = [
  { file: 'favicon-32.png',       size: 32  },
  { file: 'favicon-64.png',       size: 64  },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size } of sizes) {
  const buf = drawIcon(size);
  const dest = join(PUBLIC_DIR, file);
  writeFileSync(dest, buf);
  console.log(`✓ ${dest}  (${size}×${size})`);
}

console.log('\nReel Craft favicons generated successfully.');
