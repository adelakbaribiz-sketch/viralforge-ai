import type { FastifyInstance } from "fastify";
import { db } from "@viralforge/db";
import { requireRole } from "../auth/rbac";

export async function adminRoutes(app: FastifyInstance) {
  // All admin routes require OWNER role
  app.addHook("onRequest", requireRole("OWNER"));

  app.get("/orgs", async (_req, reply) => {
    const orgs = await db.organization.findMany({ take: 100 });
    return reply.send({ orgs });
  });

  app.get("/jobs", async (_req, reply) => {
    const jobs = await db.renderJob.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return reply.send({ jobs });
  });

  app.get("/provider-usage", async (req, reply) => {
    const usage = await db.providerUsage.findMany({ take: 200 });
    return reply.send({ usage });
  });

  app.get("/moderation", async (req, reply) => {
    const items = await db.moderationItem.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return reply.send({ items });
  });

  app.post("/moderation/:id/approve", async (req, reply) => {
    const { id } = req.params as { id: string };
    await db.moderationItem.update({ where: { id }, data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: req.userId } });
    return reply.code(204).send();
  });

  app.post("/moderation/:id/block", async (req, reply) => {
    const { id } = req.params as { id: string };
    await db.moderationItem.update({ where: { id }, data: { status: "BLOCKED", reviewedAt: new Date(), reviewedBy: req.userId } });
    return reply.code(204).send();
  });
}
