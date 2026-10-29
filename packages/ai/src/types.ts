/**
 * Shared types for the AI gateway.
 */

export type ProviderCategory = "LLM" | "TTS" | "VIDEO" | "IMAGE" | "STOCK";

export interface ProviderRequest {
  organizationId: string;
  prompt?: string;
  systemPrompt?: string;
  messages?: { role: "system" | "user" | "assistant"; content: string }[];
  maxTokens?: number;
  temperature?: number;
  language?: string;
  voiceId?: string;
  durationSec?: number;
  aspectRatio?: "9:16" | "1:1" | "16:9";
  resolution?: "720p" | "1080p" | "4K";
  seed?: number;
  negativePrompt?: string;
  idempotencyKey?: string;
}

export interface ProviderResponse<T = unknown> {
  provider: string;
  model: string;
  category: ProviderCategory;
  data: T;
  costUsd: number;
  latencyMs: number;
  tokens?: { input: number; output: number };
  cached: boolean;
}

export interface ProviderHealth {
  provider: string;
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  errorRate: number;
  lastErrorAt?: Date;
  consecutiveFailures: number;
}

export interface ProviderConfig {
  name: string;
  category: ProviderCategory;
  apiKeyEnv: string;
  baseUrl: string;
  costPer720pSec?: number; // for video providers
  costPer1kChars?: number; // for TTS
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
  costPerImage?: number;
  defaultModel: string;
  rateLimitPerMin: number;
  fallbackTo?: string;
}

export interface LLMStructuredScript {
  hook: string;
  title: string;
  description: string;
  hashtags: string[];
  scenes: {
    id: string;
    scriptText: string;
    visualPrompt: string;
    onScreenText: string;
    bRollPrompt?: string;
  }[];
  voiceover: string;
  cta: string;
}

export interface TTSResult {
  audioBuffer: Buffer;
  format: "mp3" | "wav" | "ogg";
  durationSec: number;
  wordTimestamps: { word: string; startMs: number; endMs: number }[];
}

export interface VideoGenResult {
  videoUrl: string;
  durationSec: number;
  thumbnailUrl?: string;
  metadata: {
    model: string;
    seed?: number;
    hasAudio: boolean;
  };
}

export interface ImageGenResult {
  imageUrl: string;
  width: number;
  height: number;
  metadata: { model: string; seed?: number };
}

export interface StockResult {
  assetUrl: string;
  provider: "storyblocks" | "pexels" | "pixabay";
  license: string;
  durationSec?: number;
}
