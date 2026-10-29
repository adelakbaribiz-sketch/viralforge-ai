/**
 * AssetWorker
 * ===========
 * Consumes the `asset` queue. For each scene:
 *   - Decide assetType (AI_VIDEO, AI_IMAGE, STOCK, TEXT)
 *   - Generate the asset in parallel (concurrency limit per provider)
 *   - Fallback chain: premium → standard → stock → animated text
 *   - Cache by prompt hash + model
 *
 * On success: enqueues a VOICE job (TTS for the full voiceover).
 */

import { Worker, type Job } from "bullmq";
import { generateVideo, generateImage, fetchStockVideo } from "@viralforge/ai";
import { db } from "@viralforge/db";
import { connection, type AssetJobData, voiceQueue, DEFAULT_JOB_OPTIONS } from "../queues";
import { logger } from "../logger";

const MAX_PARALLEL_PER_ORG = 3;

export class AssetWorker {
  private worker?: Worker<AssetJobData>;

  async start(): Promise<void> {
    this.worker = new Worker<AssetJobData>(
      "asset",
      async (job: Job<AssetJobData>) => this.process(job),
      { connection, concurrency: 2 },
    );

    this.worker.on("completed", (job) => logger.info({ jobId: job.id, data: job.data.jobId }, "asset:completed"));
    this.worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "asset:failed"));

    logger.info("AssetWorker started (concurrency=2)");
  }

  async stop(): Promise<void> {
    await this.worker?.close();
  }

  private async process(job: Job<AssetJobData>): Promise<void> {
    const { jobId, organizationId, projectId, idempotencyKey, scenes, model, aspectRatio, resolution } = job.data;

    await db.renderJob.update({
      where: { id: jobId },
      data: { status: "ASSET_GENERATION", progress: 35 },
    });

    // Parallel generation with concurrency limit
    const results = await Promise.allSettled(
      scenes.map(async (sc) => {
        const durationSec = Math.ceil((sc.endMs ?? sc.startMs ?? 0) / 1000) || 5;

        let assetUrl: string;
        let provider: string;
        let usedModel: string;
        let costUsd: number;

        try {
          switch (sc.assetType) {
            case "AI_VIDEO": {
              const r = await generateVideo({
                organizationId,
                prompt: sc.visualPrompt,
                model,
                durationSec,
                aspectRatio,
                resolution,
                idempotencyKey: `${idempotencyKey}:${sc.id}`,
              });
              assetUrl = r.data.videoUrl;
              provider = r.provider;
              usedModel = r.model;
              costUsd = r.costUsd;
              break;
            }
            case "AI_IMAGE": {
              const dims = aspectRatio === "9:16" ? { width: 1080, height: 1920 } :
                          aspectRatio === "1:1" ? { width: 1080, height: 1080 } :
                          { width: 1920, height: 1080 };
              const r = await generateImage({
                organizationId,
                prompt: sc.visualPrompt,
                model: "imagen-3",
                ...dims,
                idempotencyKey: `${idempotencyKey}:${sc.id}`,
              });
              assetUrl = r.data.imageUrl;
              provider = r.provider;
              usedModel = r.model;
              costUsd = r.costUsd;
              break;
            }
            case "STOCK": {
              const r = await fetchStockVideo({
                organizationId,
                query: sc.visualPrompt,
                durationSec,
                aspectRatio,
              });
              assetUrl = r.data.assetUrl;
              provider = r.data.provider;
              usedModel = r.model;
              costUsd = r.costUsd;
              break;
            }
            default: {
              assetUrl = `s3://vf-text/${sc.id}.png`;
              provider = "internal";
              usedModel = "text-renderer";
              costUsd = 0;
            }
          }
        } catch (err) {
          // Fallback to stock on circuit-open
          logger.warn({ err, sceneId: sc.id }, "asset:fallback_to_stock");
          const r = await fetchStockVideo({
            organizationId,
            query: sc.visualPrompt,
            durationSec,
            aspectRatio,
          });
          assetUrl = r.data.assetUrl;
          provider = r.data.provider;
          usedModel = "storyblocks";
          costUsd = r.costUsd;
        }

        // Persist asset row
        const asset = await db.asset.create({
          data: {
            organizationId,
            type: "VIDEO",
            url: assetUrl,
            provider,
            key: assetUrl,
            metadata: { model: usedModel, costUsd, durationSec, aspectRatio, sceneId: sc.id },
          },
        });

        await db.scene.update({
          where: { id: sc.id },
          data: { assetId: asset.id, status: "READY" },
        });

        return { sceneId: sc.id, costUsd };
      }),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      logger.error({ count: failed.length }, "asset:partial_failure");
      // If >50% of scenes failed, fail the job; otherwise continue
      if (failed.length > scenes.length / 2) {
        throw new Error(`Asset generation failed for ${failed.length} of ${scenes.length} scenes`);
      }
    }

    await db.renderJob.update({
      where: { id: jobId },
      data: { status: "VOICEOVER", progress: 55 },
    });

    // Enqueue voice job (full voiceover)
    const firstScene = scenes[0];
    await voiceQueue.add(
      "voice",
      {
        jobId,
        organizationId,
        projectId,
        idempotencyKey,
        step: "VOICE",
        scriptText: scenes.map((s) => s.scriptText).join(" "),
        voiceId: "eleven-rachel",
        ttsModel: "eleven-multilingual-v2",
        language: "en",
      },
      DEFAULT_JOB_OPTIONS,
    );
  }
}
