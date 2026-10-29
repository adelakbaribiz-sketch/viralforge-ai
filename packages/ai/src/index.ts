/**
 * ViralForge AI — Internal AI Provider Gateway
 * ==================================================
 * One unified adapter for:
 *   - LLM:        OpenAI, Anthropic, Google Gemini
 *   - TTS:        ElevenLabs (Flash + Multilingual v2), OpenAI TTS
 *   - Video:      Runway (Gen-4 Turbo, Gen-4.5), Pika 2.5, Luma,
 *                 Kling, Hailuo, Google Veo
 *   - Image:      Imagen 3, DALL-E 3, Flux
 *   - Stock:      Storyblocks, Pexels, Pixabay (licensed only)
 *
 * Features:
 *   - Cost metering per request (persisted to ProviderUsage)
 *   - Rate limiting per provider + per organization
 *   - Fallback chains (premium → standard → stock)
 *   - Circuit breaker (per provider, 5% error rate → 30s trip)
 *   - Retry with exponential backoff (idempotency-key aware)
 *   - Per-prompt-hash caching for image/video generation
 *
 * No-Code Forbidden:
 *   This module does NOT use Make.com, n8n, Zapier, or any no-code
 *   automation tool. All orchestration is implemented in TypeScript.
 */

export * from "./types";
export * from "./gateway";
export * from "./circuit-breaker";
export * from "./rate-limiter";
export * from "./cost-meter";
export * from "./providers/llm";
export * from "./providers/tts";
export * from "./providers/video";
export * from "./providers/image";
export * from "./providers/stock";
