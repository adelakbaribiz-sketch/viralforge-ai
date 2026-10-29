/**
 * BullMQ Queue Definitions
 * ========================
 * 5 separate queues for the render pipeline:
 *
 *   1. SCRIPT         - LLM generates structured script (hook, scenes, voiceover)
 *   2. ASSET          - Per-scene asset planning + parallel AI/stock generation
 *   3. VOICE          - TTS with word-level timestamps
 *   4. RENDER          - Remotion composition + FFmpeg audio mix / encode
 *   5. QC             - Duration, black frames, audio levels, captions, safety, copyright
 *
 * Each queue has its own retry policy. All jobs carry an idempotencyKey.
 */

import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";

export const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const connection = redis;

export interface BaseJobData {
  jobId: string;          // RenderJob.id
  organizationId: string;
  projectId: string;
  idempotencyKey: string; // deduplication
  step: "SCRIPT" | "ASSET" | "VOICE" | "RENDER" | "QC";
  attempt?: number;
}

export interface ScriptJobData extends BaseJobData {
  step: "SCRIPT";
  brief: Record<string, unknown>;
  category: string;
  language: string;
  tone: string;
  durationSec: number;
  brandKitId?: string;
}

export interface AssetJobData extends BaseJobData {
  step: "ASSET";
  scenes: Array<{
    id: string;
    index: number;
    scriptText: string;
    visualPrompt: string;
    assetType: "AI_VIDEO" | "AI_IMAGE" | "STOCK" | "TEXT" | "MIXED";
  }>;
  model: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  resolution: "720p" | "1080p" | "4K";
}

export interface VoiceJobData extends BaseJobData {
  step: "VOICE";
  scriptText: string;
  voiceId: string;
  ttsModel: "eleven-flash" | "eleven-multilingual-v2" | "openai-tts";
  language: string;
}

export interface RenderJobData extends BaseJobData {
  step: "RENDER";
  projectId: string;
  templateId: string;
  compositionId: string;
  outputKey: string;
  resolution: "720p" | "1080p" | "4K";
  aspectRatio: "9:16" | "1:1" | "16:9";
  durationSec: number;
  burnInCaptions: boolean;
  musicKey?: string;
  watermark?: boolean;
  introKey?: string;
  outroKey?: string;
}

export interface QCJobData extends BaseJobData {
  step: "QC";
  outputKey: string;
  expectedDurationSec: number;
  expectedAspect: "9:16" | "1:1" | "16:9";
}

// Default retry policy: exponential backoff, 3 retries, 5min cap
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 1000,
  },
  removeOnComplete: { count: 100, age: 24 * 3600 },
  removeOnFail: { count: 1000, age: 7 * 24 * 3600 },
};

// Longer timeout for video render (remotion + ffmpeg can take 10+ min)
export const RENDER_JOB_OPTIONS = {
  ...DEFAULT_JOB_OPTIONS,
  attempts: 2,
  backoff: { type: "exponential" as const, delay: 5000 },
};

// Priority boost for higher plans (Pro+, Business, Agency)
export function priorityForPlan(plan: string): number {
  switch (plan) {
    case "AGENCY": return 10;
    case "BUSINESS": return 5;
    case "PRO": return 2;
    default: return 0;
  }
}

export const scriptQueue = new Queue<ScriptJobData>("script", { connection });
export const assetQueue = new Queue<AssetJobData>("asset", { connection });
export const voiceQueue = new Queue<VoiceJobData>("voice", { connection });
export const renderQueue = new Queue<RenderJobData>("render", { connection });
export const qcQueue = new Queue<QCJobData>("qc", { connection });

export const scriptEvents = new QueueEvents("script", { connection });
export const assetEvents = new QueueEvents("asset", { connection });
export const voiceEvents = new QueueEvents("voice", { connection });
export const renderEvents = new QueueEvents("render", { connection });
export const qcEvents = new QueueEvents("qc", { connection });

export const QUEUES = { scriptQueue, assetQueue, voiceQueue, renderQueue, qcQueue };
