/**
 * ScriptWorker
 * ===========
 * Consumes the `script` queue. Calls the LLM adapter to generate a structured
 * script, validates with Zod, and persists scenes to the database.
 *
 * On success: enqueues an ASSET job.
 * On failure: exponential backoff retry, then DLQ.
 *
 * Idempotency: jobId + idempotencyKey. Re-running a job that already produced
 * scenes returns the existing scenes (no duplicate spend).
 */

import { Worker, type Job } from "bullmq";
import { generateScript } from "@viralforge/ai";
import { db } from "@viralforge/db";
import { connection, type ScriptJobData, assetQueue, DEFAULT_JOB_OPTIONS } from "../queues";
import { logger } from "../logger";

export class ScriptWorker {
  private worker?: Worker<ScriptJobData>;

  async start(): Promise<void> {
    this.worker = new Worker<ScriptJobData>(
      "script",
      async (job: Job<ScriptJobData>) => this.process(job),
      { connection, concurrency: 4 },
    );

    this.worker.on("completed", (job) => logger.info({ jobId: job.id, data: job.data.jobId }, "script:completed"));
    this.worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "script:failed"));

    logger.info("ScriptWorker started (concurrency=4)");
  }

  async stop(): Promise<void> {
    await this.worker?.close();
  }

  private async process(job: Job<ScriptJobData>): Promise<void> {
    const { jobId, organizationId, projectId, idempotencyKey, brief, category, language, tone, durationSec } = job.data;

    // Idempotency check: if scenes already exist for this project, skip
    const existing = await db.scene.findFirst({ where: { projectId } });
    if (existing) {
      logger.info({ projectId, idempotencyKey }, "script:already_exists");
      return;
    }

    // Update job status
    await db.renderJob.update({
      where: { id: jobId },
      data: { status: "SCRIPTING", progress: 10, startedAt: new Date() },
    });

    // Generate structured script via LLM
    const result = await generateScript({
      organizationId,
      brief,
      category,
      language,
      tone,
      durationSec,
      idempotencyKey,
    });

    // Persist scenes
    await db.scene.createMany({
      data: result.data.scenes.map((sc, i) => ({
        projectId,
        index: i,
        scriptText: sc.scriptText,
        visualPrompt: sc.visualPrompt,
        caption: sc.onScreenText,
        assetType: "AI_VIDEO",
        startMs: Math.round((i * durationSec * 1000) / result.data.scenes.length),
        endMs: Math.round(((i + 1) * durationSec * 1000) / result.data.scenes.length),
        status: "READY",
        metadata: { onScreenText: sc.onScreenText, bRollPrompt: sc.bRollPrompt },
      })),
    });

    // Record provider usage for cost metering
    await db.providerUsage.upsert({
      where: { organizationId_provider_model: { organizationId, provider: "openai", model: "gpt-4o" } },
      create: {
        organizationId,
        provider: "openai",
        category: "LLM",
        model: "gpt-4o",
        calls: { increment: 1 },
        costUsd: result.costUsd,
        inputTokens: result.tokens?.input ?? 0,
        outputTokens: result.tokens?.output ?? 0,
        avgLatencyMs: result.latencyMs,
      },
      update: {
        calls: { increment: 1 },
        costUsd: { increment: result.costUsd },
        inputTokens: { increment: result.tokens?.input ?? 0 },
        outputTokens: { increment: result.tokens?.output ?? 0 },
        lastCallAt: new Date(),
      },
    });

    await db.renderJob.update({
      where: { id: jobId },
      data: { status: "ASSET_PLANNING", progress: 25 },
    });

    // Enqueue asset generation
    const scenes = await db.scene.findMany({ where: { projectId }, orderBy: { index: "asc" } });
    await assetQueue.add(
      "asset",
      {
        jobId,
        organizationId,
        projectId,
        idempotencyKey,
        step: "ASSET",
        scenes: scenes.map((s) => ({
          id: s.id,
          index: s.index,
          scriptText: s.scriptText,
          visualPrompt: s.visualPrompt,
          assetType: s.assetType as "AI_VIDEO" | "AI_IMAGE" | "STOCK" | "TEXT" | "MIXED",
        })),
        model: "pika-2.5", // default; user overrides in brief
        aspectRatio: "9:16",
        resolution: "1080p",
      },
      DEFAULT_JOB_OPTIONS,
    );
  }
}
