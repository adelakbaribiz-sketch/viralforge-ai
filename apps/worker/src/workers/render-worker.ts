/**
 * RenderWorker
 * ============
 * Consumes the `render` queue. Calls Remotion to compose the final video,
 * then FFmpeg to mix audio, apply music ducking, encode to MP4, and burn
 * captions.
 *
 * Render runs ONLY in this worker process — never in the main API.
 * The API returns 202 Accepted and the frontend subscribes via SSE.
 *
 * Output dimensions:
 *   720p  → 1280×720 (or 720×1280 vertical, 720×720 square)
 *   1080p → 1920×1080 (or 1080×1920, 1080×1080)
 *   4K    → 3840×2160 (or 2160×3840, 2160×2160)
 */

import { Worker, type Job } from "bullmq";
import { db } from "@viralforge/db";
import { renderMedia, selectComposition } from "@viralforge/video";
import { connection, type RenderJobData, qcQueue, RENDER_JOB_OPTIONS } from "../queues";
import { logger } from "../logger";
import { execFfmpeg } from "@viralforge/video/ffmpeg";

export class RenderWorker {
  private worker?: Worker<RenderJobData>;

  async start(): Promise<void> {
    this.worker = new Worker<RenderJobData>(
      "render",
      async (job: Job<RenderJobData>) => this.process(job),
      { connection, concurrency: 1 }, // Render is GPU-heavy; keep concurrency low
    );
    this.worker.on("completed", (job) => logger.info({ jobId: job.id }, "render:completed"));
    this.worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "render:failed"));
    logger.info("RenderWorker started (concurrency=1, GPU-bound)");
  }

  async stop(): Promise<void> {
    await this.worker?.close();
  }

  private async process(job: Job<RenderJobData>): Promise<void> {
    const {
      jobId,
      organizationId,
      projectId,
      idempotencyKey,
      compositionId,
      outputKey,
      resolution,
      aspectRatio,
      durationSec,
      burnInCaptions,
      musicKey,
      watermark,
      introKey,
      outroKey,
    } = job.data;

    await db.renderJob.update({
      where: { id: jobId },
      data: { status: "ASSEMBLING", progress: 80 },
    });

    // 1. Render Remotion composition to raw video (no audio mix yet)
    const composition = selectComposition(compositionId, aspectRatio, resolution, durationSec);
    const rawVideoKey = `vf-tmp/${idempotencyKey}_raw.mp4`;
    await renderMedia({
      composition,
      outputLocation: `s3://vf-tmp/${idempotencyKey}_raw.mp4`,
      codec: "h264",
      onProgress: (p) => {
        // Update progress 80 → 90 during render
        db.renderJob.update({
          where: { id: jobId },
          data: { progress: 80 + Math.round(p * 10) },
        }).catch(() => {});
      },
    });

    await db.renderJob.update({
      where: { id: jobId },
      data: { status: "RENDERING", progress: 90 },
    });

    // 2. FFmpeg: mix audio, music ducking, burn captions, watermark, encode
    await execFfmpeg([
      "-i", `s3://${rawVideoKey}`,
      "-i", `s3://vf-voice/${idempotencyKey}.mp3`,
      ...(musicKey ? ["-i", `s3://${musicKey}`] : []),
      // Voice + music with ducking at -12 dB
      "-filter_complex",
      `[0:a]loudnorm=I=-14:LRA=11:TP=-1.5[vocals];` +
        (musicKey ? `[1:a]volume=0.3[bgm];[vocals][bgm]sidechaincompress=threshold=0.05:ratio=8:attack=5:release=300[mix]` : `[vocals]mix`),
      "-map", "0:v",
      "-map", burnInCaptions ? "[mix]" : "1:a",
      // Burn-in captions (SRT/ASS)
      ...(burnInCaptions ? ["-vf", `subtitles=s3://vf-captions/${idempotencyKey}.ass:force_style='FontName=Inter,FontSize=12,PrimaryColour=&Hffffff,OutlineColour=&H000000,BorderStyle=1,Outline=2'`] : []),
      // Watermark (free plan)
      ...(watermark ? ["-i", "s3://vf-watermark/watermark.png", "-filter_complex", "overlay=W-w-20:20"] : []),
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", resolution === "4K" ? "20" : "18",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      `s3://${outputKey}`,
    ]);

    await db.renderJob.update({
      where: { id: jobId },
      data: {
        status: "QC",
        progress: 95,
        outputKey,
        outputUrl: `s3://${outputKey}`,
      },
    });

    // Enqueue QC job
    await qcQueue.add(
      "qc",
      {
        jobId,
        organizationId,
        projectId,
        idempotencyKey,
        step: "QC",
        outputKey,
        expectedDurationSec: durationSec,
        expectedAspect: aspectRatio,
      },
      RENDER_JOB_OPTIONS,
    );
  }
}
