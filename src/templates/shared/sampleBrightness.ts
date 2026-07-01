const cache = new Map<string, number>();

const SIZE = 64;

function drawVideoFrame(ctx: CanvasRenderingContext2D, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;

    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) {
        reject(err);
      } else {
        try {
          ctx.drawImage(video, 0, 0, SIZE, SIZE);
          resolve();
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      }
    };

    const timer = setTimeout(() => finish(new Error("timeout")), 4000);

    video.addEventListener("error", () => finish(new Error("video error")), { once: true });
    video.addEventListener("loadedmetadata", () => {
      const t = Math.min(0.5, video.duration || 0);
      const onSeeked = () => finish();
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = t;
      // If already positioned at t (e.g. very short clip at 0), seeked won't fire.
      if (video.currentTime === t && video.readyState >= 2) {
        video.removeEventListener("seeked", onSeeked);
        finish();
      }
    }, { once: true });

    video.src = src;
    video.load();
  });
}

function drawImageFrame(ctx: CanvasRenderingContext2D, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener("load", () => {
      try {
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        resolve();
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    }, { once: true });
    img.addEventListener("error", () => reject(new Error("image error")), { once: true });
    img.src = src;
  });
}

export async function sampleBackgroundBrightness(src: string): Promise<number> {
  if (cache.has(src)) return cache.get(src)!;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0.5;

    // Try video first (works for blob: URLs from video files), fall back to image.
    try {
      await drawVideoFrame(ctx, src);
    } catch {
      await drawImageFrame(ctx, src);
    }

    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    let total = 0;
    const count = SIZE * SIZE;
    for (let i = 0; i < data.length; i += 4) {
      total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }

    const brightness = total / count / 255;
    cache.set(src, brightness);
    return brightness;
  } catch {
    return 0.5;
  }
}
