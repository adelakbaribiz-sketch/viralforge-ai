/**
 * Render Job Submission
 * ====================
 * POST /v1/render — creates a new RenderJob, reserves credits, enqueues the
 * script job on BullMQ, and returns 202 Accepted. The worker pool handles
 * the rest; the frontend subscribes via SSE for live progress.
 *
 * Idempotency: if `idempotencyKey` already exists, returns the existing job
 * instead of creating a new one. No duplicate spend.
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@viralforge/db";
import { reserveCredits, InsufficientCreditsError } from "@viralforge/db/credits";
import { scriptQueue, DEFAULT_JOB_OPTIONS, priorityForPlan } from "@viralforge/worker/queues";
import { requireRole } from "../auth/rbac";

const Body = z.object({
  idempotencyKey: z.string().min(8),
  projectId: z.string().cuid(),
  model: z.enum(["pika-2.5", "hailuo", "runway-g4-turbo", "luma", "kling-standard", "veo-omni-flash", "runway-g45"]),
  aspectRatio: z.enum(["9:16", "1:1", "16:9"]),
  resolution: z.enum(["720p", "1080p", "4K"]),
  durationSec: z.number().int().min(15).max(120),
  voiceId: z.string(),
  ttsModel: z.enum(["eleven-flash", "eleven-multilingual-v2", "openai-tts"]),
  burnInCaptions: z.boolean().default(true),
  musicKey: z.string().optional(),
  templateId: z.string().optional(),
});

const RESOLUTION_MULT: Record<string, number> = { "720p": 1, "1080p": 2, "4K": 4 };
const MODEL_MULT: Record<string, number> = {
  "pika-2.5": 1, "hailuo": 1, "runway-g4-turbo": 1,
  "luma": 2, "kling-standard": 2, "veo-omni-flash": 2, "runway-g45": 4,
};

export async function renderRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: requireRole("EDITOR") }, async (req, reply) => {
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const body = parsed.data;
    const orgId = req.orgId!;
    const plan = (await db.subscription.findUnique({ where: { organizationId: orgId } }))?.plan ?? "FREE";

    // Idempotency check
    const existing = await db.renderJob.findUnique({ where: { idempotencyKey: body.idempotencyKey } });
    if (existing) {
      return reply.code(200).send({ jobId: existing.id, status: existing.status, idempotent: true });
    }

    // Estimate credit cost
    const estimatedCredits = body.durationSec * RESOLUTION_MULT[body.resolution] * MODEL_MULT[body.model];

    // Atomic: create job + reserve credits in one transaction
    let job;
    try {
      job = await db.$transaction(async (tx) => {
        const j = await tx.renderJob.create({
          data: {
            projectId: body.projectId,
            organizationId: orgId,
            status: "QUEUED",
            idempotencyKey: body.idempotencyKey,
            aspectRatio: body.aspectRatio === "9:16" ? "R9_16" : body.aspectRatio === "1:1" ? "R1_1" : "R16_9",
            resolution: body.resolution === "720p" ? "P720" : body.resolution === "1080p" ? "P1080" : "P4K",
            durationSec: body.durationSec,
            estimatedCostCredits: estimatedCredits,
            model: body.model,
          },
        });
        await reserveCredits(tx, orgId, estimatedCredits, j.id);
        return j;
      });
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        return reply.code(402).send({
          error: "INSUFFICIENT_CREDITS",
          requested: err.requested,
          available: err.available,
        });
      }
      throw err;
    }

    // Enqueue script job with priority based on plan
    await scriptQueue.add(
      "script",
      {
        jobId: job.id,
        organizationId: orgId,
        projectId: body.projectId,
        idempotencyKey: body.idempotencyKey,
        step: "SCRIPT",
        brief: {}, // populated from project.brief
        category: "science",
        language: "en",
        tone: "informative",
        durationSec: body.durationSec,
      },
      { ...DEFAULT_JOB_OPTIONS, priority: priorityForPlan(plan) },
    );

    // 202 Accepted — workers handle the rest
    return reply.code(202).send({
      jobId: job.id,
      status: "QUEUED",
      estimatedCostCredits: estimatedCredits,
      progressUrl: `/v1/render/${job.id}/progress`,
    });
  });

  // SSE for live progress
  app.get("/:jobId/progress", { preHandler: requireRole("VIEWER") }, async (req, reply) => {
    const { jobId } = req.params as { jobId: string };
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    // In production: subscribe to Redis pubsub channel for this job's progress events.
    // BullMQ job.updateProgress() publishes to a channel that this handler listens on.
    const interval = setInterval(async () => {
      const job = await db.renderJob.findUnique({ where: { id: jobId } });
      if (!job) {
        reply.raw.write(`event: error\ndata: ${JSON.stringify({ error: "not_found" })}\n\n`);
        clearInterval(interval);
        return reply.raw.end();
      }
      reply.raw.write(`data: ${JSON.stringify({ status: job.status, progress: job.progress })}\n\n`);
      if (job.status === "COMPLETED" || job.status === "FAILED") {
        clearInterval(interval);
        reply.raw.end();
      }
    }, 1000);

    req.raw.on("close", () => clearInterval(interval));
  });
}
