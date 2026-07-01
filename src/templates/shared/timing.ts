export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const MIN_SECONDS = 3;
const MAX_SECONDS = 14;
const READING_WORDS_PER_SECOND = 2.5;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Duration is derived, not configured: enough time to read every word,
// plus a breath in and out. Clamped so it never feels rushed or draggy.
export function durationInFramesFor(text: string, fps: number = FPS): number {
  const words = Math.max(wordCount(text), 1);
  const intro = 0.6 * fps;
  const outro = 0.9 * fps;
  const read = (words / READING_WORDS_PER_SECOND) * fps;
  const total = intro + read + outro;
  const clamped = Math.min(Math.max(total, MIN_SECONDS * fps), MAX_SECONDS * fps);
  return Math.round(clamped);
}
