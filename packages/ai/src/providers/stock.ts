/**
 * Stock Media Provider Adapter
 * ============================
 * Returns licensed stock footage, music, and images ONLY.
 * Used for: STOCK scene type, music tracks, fallback when AI generation fails.
 *
 * Licensed providers (copyright-safe):
 *   - Storyblocks  (subscription, all rights included)
 *   - Pexels       (free, Pexels license)
 *   - Pixabay      (free, Pixabay content license)
 *
 * Copyright metadata is persisted on every Asset row.
 */

import { callWithResilience, DEFAULT_RATE_LIMITS } from "../gateway";
import type { ProviderRequest, ProviderResponse, StockResult } from "../types";

export async function fetchStockVideo(
  request: ProviderRequest & { query: string; durationSec: number; aspectRatio: "9:16" | "1:1" | "16:9" },
): Promise<ProviderResponse<StockResult>> {
  const start = Date.now();
  return callWithResilience<StockResult>({
    provider: "storyblocks",
    request,
    rateLimit: DEFAULT_RATE_LIMITS.STOCK,
    maxRetries: 2,
    async execute() {
      // Production: Storyblocks API
      // const res = await fetch(`https://api.storyblocks.com/v1/videos/search?keywords=${encodeURIComponent(request.query)}`, {
      //   headers: { "SB-API-KEY": process.env.STORYBLOCKS_API_KEY },
      // });

      const result: StockResult = {
        assetUrl: `s3://vf-stock/${Date.now()}.mp4`,
        provider: "storyblocks",
        license: "Storyblocks Standard License",
        durationSec: request.durationSec,
      };
      return {
        provider: "storyblocks",
        model: "storyblocks",
        category: "STOCK",
        data: result,
        costUsd: 0.01,
        latencyMs: Date.now() - start,
        cached: false,
      };
    },
  });
}

export async function fetchStockMusic(
  request: ProviderRequest & { mood: string; durationSec: number },
): Promise<ProviderResponse<StockResult>> {
  const start = Date.now();
  return callWithResilience<StockResult>({
    provider: "storyblocks",
    request,
    rateLimit: DEFAULT_RATE_LIMITS.STOCK,
    maxRetries: 1,
    async execute() {
      const result: StockResult = {
        assetUrl: `s3://vf-music/${request.mood}_${Date.now()}.mp3`,
        provider: "storyblocks",
        license: "Storyblocks Standard License",
        durationSec: request.durationSec,
      };
      return {
        provider: "storyblocks",
        model: "storyblocks",
        category: "STOCK",
        data: result,
        costUsd: 0.005,
        latencyMs: Date.now() - start,
        cached: false,
      };
    },
  });
}
