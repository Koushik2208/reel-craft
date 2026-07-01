export type ContrastAdjustment = {
  textColor: string;
  overlayOpacity: number;
};

export function getContrastAdjustment(brightness: number): ContrastAdjustment {
  if (brightness > 0.65) return { textColor: "#0F0F12", overlayOpacity: 1.4 };
  if (brightness > 0.45) return { textColor: "#FFFFFF", overlayOpacity: 1.2 };
  return { textColor: "#FFFFFF", overlayOpacity: 1.0 };
}

// Multiplies the alpha of an "rgba(r,g,b,a)" string, clamped to [0, 0.95].
export function applyOpacityMultiplier(rgba: string, multiplier: number): string {
  const match = rgba.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)/
  );
  if (!match) return rgba;
  const newA = Math.min(0.95, parseFloat(match[4]) * multiplier);
  return `rgba(${match[1]},${match[2]},${match[3]},${newA.toFixed(3)})`;
}
