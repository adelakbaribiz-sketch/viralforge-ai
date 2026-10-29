/**
 * TTS Provider Adapter
 * ====================
 * Generates voiceover audio + word-level timestamps for caption sync.
 *
 * Providers:
 *   - ElevenLabs Flash        (cheap, fast, English)
 *   - ElevenLabs Multilingual v2 (quality, all languages incl. Persian/Arabic)
 *   - OpenAI TTS             (cheapest, fastest)
 *
 * Audio is normalized to -14 LUFS in packages/video (FFmpeg).
 */

import { callWithResilience, DEFAULT_RATE_LIMITS } from "../gateway";
import { ttsCostUsd } from "../cost-meter";
import type { ProviderRequest, ProviderResponse, TTSResult } from "../types";

export async function generateVoiceover(
  request: ProviderRequest & {
    text: string;
    voiceId: string;
    model: "eleven-flash" | "eleven-multilingual-v2" | "openai-tts";
    language?: string;
  },
): Promise<ProviderResponse<TTSResult>> {
  const start = Date.now();
  const providerName = request.model.startsWith("eleven") ? "elevenlabs" : "openai-tts";

  return callWithResilience<TTSResult>({
    provider: providerName,
    request,
    rateLimit: DEFAULT_RATE_LIMITS.TTS,
    maxRetries: 2,
    async execute() {
      // ElevenLabs API call (pseudocode):
      // const url = `https://api.elevenlabs.io/v1/text-to-speech/${request.voiceId}`;
      // const res = await fetch(url, {
      //   method: "POST",
      //   headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     text: request.text,
      //     model_id: request.model === "eleven-flash" ? "eleven_flash_v2" : "eleven_multilingual_v2",
      //     voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      //     with_timestamps: true,  // returns word-level alignment
      //   }),
      // });

      // Simulated response:
      const charCount = request.text.length;
      const durationSec = Math.ceil(charCount / 15); // ~15 chars/sec narration
      const audioBuffer = Buffer.alloc(0);
      const wordTimestamps = computeApproximateTimestamps(request.text, durationSec);
      const costUsd = ttsCostUsd(request.model, charCount);

      return {
        provider: providerName,
        model: request.model,
        category: "TTS",
        data: { audioBuffer, format: "mp3", durationSec, wordTimestamps },
        costUsd,
        latencyMs: Date.now() - start,
        cached: false,
      };
    },

    async fallback() {
      // OpenAI TTS as ultimate fallback
      const start = Date.now();
      const data: TTSResult = {
        audioBuffer: Buffer.alloc(0),
        format: "mp3",
        durationSec: Math.ceil(request.text.length / 15),
        wordTimestamps: computeApproximateTimestamps(request.text, 30),
      };
      return {
        provider: "openai-tts",
        model: "openai-tts",
        category: "TTS",
        data,
        costUsd: 0.001,
        latencyMs: Date.now() - start,
        cached: false,
      };
    },
  });
}

function computeApproximateTimestamps(
  text: string,
  durationSec: number,
): { word: string; startMs: number; endMs: number }[] {
  const words = text.split(/\s+/);
  const totalMs = durationSec * 1000;
  const perWordMs = totalMs / Math.max(words.length, 1);
  return words.map((word, i) => ({
    word,
    startMs: Math.round(i * perWordMs),
    endMs: Math.round((i + 1) * perWordMs),
  }));
}
