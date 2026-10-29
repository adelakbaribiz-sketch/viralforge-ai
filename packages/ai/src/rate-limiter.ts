/**
 * Rate Limiter
 * ===========
 * Token bucket per (organizationId, provider). Buckets refill at a steady
 * rate up to a max capacity. Used to avoid hammering expensive video models.
 *
 * In production, this is backed by Redis so it works across multiple worker
 * processes. Locally, an in-memory Map is used.
 */

interface Bucket {
  tokens: number;
  lastRefillAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitConfig {
  capacity: number; // bucket size
  refillPerSec: number; // tokens added per second
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; retryAfterMs?: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: config.capacity, lastRefillAt: now };
    buckets.set(key, bucket);
  }

  // Refill
  const elapsedSec = (now - bucket.lastRefillAt) / 1000;
  bucket.tokens = Math.min(config.capacity, bucket.tokens + elapsedSec * config.refillPerSec);
  bucket.lastRefillAt = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: Math.floor(bucket.tokens) };
  }

  const retryAfterMs = Math.ceil((1 - bucket.tokens) / config.refillPerSec * 1000);
  return { allowed: false, remaining: 0, retryAfterMs };
}

export function resetRateLimit(key?: string): void {
  if (key) buckets.delete(key);
  else buckets.clear();
}
