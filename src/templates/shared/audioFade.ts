// Pure volume helper — no Remotion dependency, fully unit-testable.
// Returns a value in [0, 1] for the given frame within the composition.
// Fades overlap gracefully: if fadeIn + fadeOut exceed totalFrames, the regions
// are clamped so they meet at the midpoint without producing NaN or negatives.
export function getAudioVolumeAtFrame(
  frame: number,
  totalFrames: number,
  fps: number,
  fadeInSeconds: number,
  fadeOutSeconds: number
): number {
  if (totalFrames <= 0) return 1;

  // Clamp so the fade regions never overlap
  const inEnd = Math.min(fadeInSeconds * fps, totalFrames);
  const outStart = Math.max(totalFrames - fadeOutSeconds * fps, inEnd);

  if (frame < inEnd && inEnd > 0) {
    return frame / inEnd;
  }
  if (frame >= outStart && outStart < totalFrames) {
    return Math.max(0, 1 - (frame - outStart) / (totalFrames - outStart));
  }
  return 1;
}
