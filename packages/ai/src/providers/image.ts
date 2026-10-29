/**
 * Image Generation Provider Adapter
 * =================================
 * Generates still images for AI_IMAGE scene type.
 *
 * Providers:
 *   - Imagen 3        (Google, $0.020/image, best for general scenes)
 *   - DALL-E 3        (OpenAI, $0.040/image, best for stylized)
 *   - Flux Pro        ($0.055/image, premium quality)
 *   - Flux Schnell    ($0.003/image, fastest/cheapest)
 */

import { callWithResilience, DEFAULT_RATE_LIMITS } from "../gateway";
import { imageCostUsd } from "../cost-meter";
import { createHash } from "node:crypto";
import type { ProviderRequest, ProviderResponse, ImageGenResult } from "../types";

const cache = new Map<string, ImageGenResult>();

export async function generateImage(
  request: ProviderRequest & {
    model: string;
    width: number;
    height: number;
  },
): Promise<ProviderResponse<ImageGenResult>> {
  const cacheKey = createHash("sha256")
    .update(`${request.prompt}|${request.model}|${request.width}x${request.height}`)
    .digest("hex");

  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      provider: "cache",
      model: request.model,
      category: "IMAGE",
      data: cached,
      costUsd: 0,
      latencyMs: 0,
      cached: true,
    };
  }

  const providerName =
    request.model.startsWith("imagen") ? "google" :
    request.model.startsWith("dall-e") ? "openai" :
    "flux";

  const start = Date.now();

  return callWithResilience<ImageGenResult>({
    provider: providerName,
    request,
    rateLimit: DEFAULT_RATE_LIMITS.IMAGE,
    maxRetries: 2,
    async execute() {
      // Production example (Imagen 3 via Google):
      // const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict", {
      //   method: "POST",
      //   headers: { "x-goog-api-key": process.env.GOOGLE_API_KEY },
      //   body: JSON.stringify({
      //     instances: [{ prompt: request.prompt }],
      //     parameters: { sampleCount: 1, aspectRatio: `${request.width}:${request.height}` },
      //   }),
      // });

      // Simulated:
      const result: ImageGenResult = {
        imageUrl: `s3://vf-images/${cacheKey}.png`,
        width: request.width,
        height: request.height,
        metadata: { model: request.model, seed: request.seed },
      };
      cache.set(cacheKey, result);

      return {
        provider: providerName,
        model: request.model,
        category: "IMAGE",
        data: result,
        costUsd: imageCostUsd(request.model, 1),
        latencyMs: Date.now() - start,
        cached: false,
      };
    },

    async fallback() {
      // Flux Schnell as ultimate fallback
      const start = Date.now();
      const fallbackModel = "flux-schnell";
      const result: ImageGenResult = {
        imageUrl: `s3://vf-images/fallback_${cacheKey}.png`,
        width: request.width,
        height: request.height,
        metadata: { model: fallbackModel },
      };
      cache.set(cacheKey, result);
      return {
        provider: "flux",
        model: fallbackModel,
        category: "IMAGE",
        data: result,
        costUsd: imageCostUsd(fallbackModel, 1),
        latencyMs: Date.now() - start,
        cached: false,
      };
    },
  });
}
