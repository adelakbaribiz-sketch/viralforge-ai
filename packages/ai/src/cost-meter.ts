/**
 * Cost Meter
 * ==========
 * Per-request cost calculation and persistence to ProviderUsage.
 *
 * Reference unit economics (October 2026, 720p, USD per second):
 *   Pika 2.5                  ~0.040
 *   Hailuo                    ~0.047
 *   Runway Gen-4 Turbo        ~0.050
 *   Luma Dream Machine        ~0.060
 *   Kling (Standard)          ~0.084
 *   Gemini Veo (Omni Flash)   ~0.100
 *   Runway Gen-4.5            ~0.120
 *
 * TTS per 1000 chars:
 *   ElevenLabs Flash           ~0.040
 *   ElevenLabs Multilingual v2 ~0.080
 *   OpenAI TTS                 ~0.015
 */

export const VIDEO_COST_PER_SEC_720P: Record<string, number> = {
  "pika-2.5": 0.040,
  "hailuo": 0.047,
  "runway-g4-turbo": 0.050,
  "luma": 0.060,
  "kling-standard": 0.084,
  "veo-omni-flash": 0.100,
  "runway-g45": 0.120,
};

export const TTS_COST_PER_1K_CHARS: Record<string, number> = {
  "eleven-flash": 0.040,
  "eleven-multilingual-v2": 0.080,
  "openai-tts": 0.015,
};

export const LLM_COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "claude-3-5-sonnet": { input: 0.003, output: 0.015 },
  "claude-3-haiku": { input: 0.00025, output: 0.00125 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
  "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
};

export const IMAGE_COST_PER_IMAGE: Record<string, number> = {
  "imagen-3": 0.020,
  "dall-e-3": 0.040,
  "flux-pro": 0.055,
  "flux-schnell": 0.003,
};

/**
 * Resolution multiplier on credit spend.
 *   720p → 1
 *   1080p → 2
 *   4K    → 4
 */
export const RESOLUTION_MULTIPLIER: Record<string, number> = {
  "720p": 1,
  "1080p": 2,
  "4K": 4,
};

/**
 * Premium model multiplier on credit spend.
 * Standard models = 1x; premium = 2-4x.
 */
export const MODEL_MULTIPLIER: Record<string, number> = {
  "pika-2.5": 1,
  "hailuo": 1,
  "runway-g4-turbo": 1,
  "luma": 2,
  "kling-standard": 2,
  "veo-omni-flash": 2,
  "runway-g45": 4,
};

/**
 * Convert provider USD cost to credit cost.
 * 1 credit = 1 second of 720p video with a standard model.
 * 1080p = 2×, 4K = 4×, premium models 2-4×.
 */
export function creditsForRender(durationSec: number, resolution: "720p" | "1080p" | "4K", model: string): number {
  const resMult = RESOLUTION_MULTIPLIER[resolution] ?? 1;
  const modelMult = MODEL_MULTIPLIER[model] ?? 1;
  return Math.ceil(durationSec * resMult * modelMult);
}

export function llmCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const tier = LLM_COST_PER_1K_TOKENS[model];
  if (!tier) return 0;
  return (inputTokens / 1000) * tier.input + (outputTokens / 1000) * tier.output;
}

export function ttsCostUsd(model: string, charCount: number): number {
  const per1k = TTS_COST_PER_1K_CHARS[model] ?? 0;
  return (charCount / 1000) * per1k;
}

export function videoCostUsd(model: string, durationSec: number): number {
  const perSec = VIDEO_COST_PER_SEC_720P[model] ?? 0;
  return perSec * durationSec;
}

export function imageCostUsd(model: string, count: number): number {
  const per = IMAGE_COST_PER_IMAGE[model] ?? 0;
  return per * count;
}
