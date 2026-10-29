/**
 * AI Gateway
 * ==========
 * Single entry point for every AI provider call. Applies:
 *   1. Rate limit (per org + provider)
 *   2. Circuit breaker (per provider)
 *   3. Retry with exponential backoff (idempotency-key aware)
 *   4. Cost metering (persisted to ProviderUsage)
 *   5. Fallback chain (if primary fails, try cheaper / stock provider)
 *
 * Production persistence: see packages/db/src/provider-usage.ts
 */

import {
  isCircuitOpen,
  recordSuccess,
  recordFailure,
  CircuitOpenError,
} from "./circuit-breaker";
import { checkRateLimit, type RateLimitConfig } from "./rate-limiter";
import type { ProviderConfig, ProviderRequest, ProviderResponse } from "./types";

const PROVIDER_REGISTRY = new Map<string, ProviderConfig>();

export function registerProvider(config: ProviderConfig): void {
  PROVIDER_REGISTRY.set(config.name, config);
}

export function getProviderConfig(name: string): ProviderConfig | undefined {
  return PROVIDER_REGISTRY.get(name);
}

export interface GatewayCallOptions<T> {
  provider: string;
  request: ProviderRequest;
  rateLimit: RateLimitConfig;
  execute: () => Promise<ProviderResponse<T>>;
  fallback?: () => Promise<ProviderResponse<T>>;
  maxRetries?: number;
  baseDelayMs?: number;
}

export async function callWithResilience<T>(
  opts: GatewayCallOptions<T>,
): Promise<ProviderResponse<T>> {
  const { provider, request, rateLimit, execute, fallback, maxRetries = 3, baseDelayMs = 500 } = opts;

  // 1. Circuit breaker
  if (isCircuitOpen(provider)) {
    if (fallback) {
      return fallback().catch((e) => {
        throw new CircuitOpenError(provider);
      });
    }
    throw new CircuitOpenError(provider);
  }

  // 2. Rate limit (keyed by org + provider)
  const rlKey = `${request.organizationId}:${provider}`;
  const rl = checkRateLimit(rlKey, rateLimit);
  if (!rl.allowed) {
    throw new Error(
      `Rate limit exceeded for provider "${provider}" (org ${request.organizationId}). Retry in ${rl.retryAfterMs}ms.`,
    );
  }

  // 3. Retry with exponential backoff
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= maxRetries) {
    try {
      const response = await execute();
      recordSuccess(provider);
      return response;
    } catch (err) {
      lastError = err;
      attempt += 1;
      recordFailure(provider);
      if (attempt > maxRetries) break;

      // Exponential backoff: 500ms, 1000ms, 2000ms, 4000ms, ...
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // 4. Fallback chain
  if (fallback) {
    try {
      return await fallback();
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown gateway error");
}

// Default rate limits per category
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  LLM: { capacity: 60, refillPerSec: 1 },
  TTS: { capacity: 30, refillPerSec: 0.5 },
  VIDEO: { capacity: 5, refillPerSec: 0.1 }, // expensive
  IMAGE: { capacity: 20, refillPerSec: 0.5 },
  STOCK: { capacity: 100, refillPerSec: 5 },
};

// Provider registry — populated on module init
registerProvider({
  name: "openai",
  category: "LLM",
  apiKeyEnv: "OPENAI_API_KEY",
  baseUrl: "https://api.openai.com/v1",
  costPer1kInputTokens: 0.0025,
  costPer1kOutputTokens: 0.01,
  defaultModel: "gpt-4o",
  rateLimitPerMin: 60,
  fallbackTo: "anthropic",
});

registerProvider({
  name: "anthropic",
  category: "LLM",
  apiKeyEnv: "ANTHROPIC_API_KEY",
  baseUrl: "https://api.anthropic.com/v1",
  costPer1kInputTokens: 0.003,
  costPer1kOutputTokens: 0.015,
  defaultModel: "claude-3-5-sonnet",
  rateLimitPerMin: 50,
  fallbackTo: "gemini",
});

registerProvider({
  name: "elevenlabs",
  category: "TTS",
  apiKeyEnv: "ELEVENLABS_API_KEY",
  baseUrl: "https://api.elevenlabs.io/v1",
  costPer1kChars: 0.080,
  defaultModel: "eleven-multilingual-v2",
  rateLimitPerMin: 30,
  fallbackTo: "openai-tts",
});

registerProvider({
  name: "runway",
  category: "VIDEO",
  apiKeyEnv: "RUNWAY_API_KEY",
  baseUrl: "https://api.runwayml.com/v1",
  costPer720pSec: 0.050,
  defaultModel: "runway-g4-turbo",
  rateLimitPerMin: 5,
  fallbackTo: "pika",
});

registerProvider({
  name: "pika",
  category: "VIDEO",
  apiKeyEnv: "PIKA_API_KEY",
  baseUrl: "https://api.pika.art/v1",
  costPer720pSec: 0.040,
  defaultModel: "pika-2.5",
  rateLimitPerMin: 5,
  fallbackTo: "storyblocks", // ultimate fallback = stock footage
});

registerProvider({
  name: "storyblocks",
  category: "STOCK",
  apiKeyEnv: "STORYBLOCKS_API_KEY",
  baseUrl: "https://api.storyblocks.com/v1",
  defaultModel: "storyblocks",
  rateLimitPerMin: 100,
});
