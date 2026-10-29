/**
 * Video package entry — Remotion composition + FFmpeg helpers
 */

export interface Composition {
  id: string;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

export function selectComposition(
  compositionId: string,
  aspectRatio: "9:16" | "1:1" | "16:9",
  resolution: "720p" | "1080p" | "4K",
  durationSec: number,
): Composition {
  const baseDims: Record<string, { w: number; h: number }> = {
    "9:16": { w: 720, h: 1280 },
    "1:1": { w: 720, h: 720 },
    "16:9": { w: 1280, h: 720 },
  };
  const mult: Record<string, number> = { "720p": 1, "1080p": 1.5, "4K": 3 };
  const dims = baseDims[aspectRatio];
  const m = mult[resolution];
  return {
    id: compositionId,
    durationInFrames: Math.ceil(durationSec * 30),
    fps: 30,
    width: Math.round(dims.w * m),
    height: Math.round(dims.h * m),
  };
}

export interface RenderOptions {
  composition: Composition;
  outputLocation: string;
  codec: "h264" | "h265" | "vp9";
  onProgress?: (p: number) => void;
}

export async function renderMedia(opts: RenderOptions): Promise<void> {
  // Production: call @remotion/renderer's renderMedia()
  // import { renderMedia as remotionRender } from "@remotion/renderer";
  // await remotionRender({
  //   composition: opts.composition,
  //   serveUrl: process.env.REMOTION_SERVE_URL!,
  //   codec: opts.codec,
  //   outputLocation: opts.outputLocation,
  //   onProgress: ({ progress }) => opts.onProgress?.(progress),
  // });

  // Simulated render (progress increments over ~3s):
  for (let i = 0; i <= 100; i += 5) {
    opts.onProgress?.(i / 100);
    await new Promise((r) => setTimeout(r, 60));
  }
}
