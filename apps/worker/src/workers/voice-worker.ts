/**
 * VoiceWorker
 * ===========
 * Consumes the `voice` queue. Calls the TTS adapter to generate voiceover
 * audio + word-level timestamps (for caption sync).
 *
 * Audio is normalized to -14 LUFS in the render step (FFmpeg).
 */

import { Worker, type Job } from "bullmq";
import { generateVoiceover } from "@viralforge/ai";
import { db } from "@viralforge/db";
import { connection, type VoiceJobData, renderQueue, DEFAULT_JOB_OPTIONS } from "../queues";
import { logger } from "../logger";

export class VoiceWorker {
  private worker?: Worker<VoiceJobData>;

  async start(): Promise<void> {
    this.worker = new Worker<VoiceJobData>(
      "voice",
      async (job: Job<VoiceJobData>) => this.process(job),
      { connection, concurrency: 4 },
    );
    this.worker.on("completed", (job) => logger.info({ jobId: job.id }, "voice:completed"));
    this.worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "voice:failed"));
    logger.info("VoiceWorker started (concurrency=4)");
  }

  async stop(): Promise<void> {
    await this.worker?.close();
  }

  private async process(job: Job<VoiceJobData>): Promise<void> {
    const { jobId, organizationId, projectId, idempotencyKey, scriptText, voiceId, ttsModel, language } = job.data;

    await db.renderJob.update({
      where: { id: jobId },
      data: { status: "VOICEOVER", progress: 65 },
    });

    const result = await generateVoiceover({
      organizationId,
      text: scriptText,
      voiceId,
      model: ttsModel,
      language,
      idempotencyKey,
    });

    // Persist voiceover asset
    const asset = await db.asset.create({
      data: {
        organizationId,
        type: "AUDIO",
        url: `s3://vf-voice/${idempotencyKey}.mp3`,
        provider: result.provider,
        key: `vf-voice/${idempotencyKey}.mp3`,
        metadata: {
          durationSec: result.data.durationSec,
          format: result.data.format,
          wordTimestamps: result.data.wordTimestamps,
          costUsd: result.costUsd,
        },
      },
    });

    await db.renderJob.update({
      where: { id: jobId },
      data: { status: "CAPTION_SYNC", progress: 75 },
    });

    // Enqueue render job (Remotion + FFmpeg)
    await renderQueue.add(
      "render",
      {
        jobId,
        organizationId,
        projectId,
        idempotencyKey,
        step: "RENDER",
        templateId: "tpl_science_didyouknow",
        compositionId: "MainComp",
        outputKey: `vf-output/${idempotencyKey}.mp4`,
        resolution: "1080p",
        aspectRatio: "9:16",
        durationSec: result.data.durationSec,
        burnInCaptions: true,
        watermark: false,
      },
      DEFAULT_JOB_OPTIONS,
    );
  }
}
