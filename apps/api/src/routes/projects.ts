import type { FastifyInstance } from "fastify";
import { db } from "@viralforge/db";
import { requireRole } from "../auth/rbac";

export async function projectRoutes(app: FastifyInstance) {
  // List projects (auto-scoped to organizationId via middleware)
  app.get("/", { preHandler: requireRole("VIEWER") }, async (req, reply) => {
    const projects = await db.project.findMany({
      where: { organizationId: req.orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return reply.send({ projects });
  });

  app.post("/", { preHandler: requireRole("EDITOR") }, async (req, reply) => {
    const project = await db.project.create({
      data: { organizationId: req.orgId!, title: "", category: "", brief: {} as any, durationSec: 30 },
    });
    return reply.code(201).send(project);
  });

  app.get("/:id", { preHandler: requireRole("VIEWER") }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const project = await db.project.findFirst({ where: { id, organizationId: req.orgId } });
    if (!project) return reply.code(404).send({ error: "NOT_FOUND" });
    return reply.send(project);
  });

  app.delete("/:id", { preHandler: requireRole("ADMIN") }, async (req, reply) => {
    const { id } = req.params as { id: string };
    await db.project.deleteMany({ where: { id, organizationId: req.orgId } });
    return reply.code(204).send();
  });

  // Scene regeneration endpoint
  app.post("/scenes/:sceneId/regenerate", { preHandler: requireRole("EDITOR") }, async (req, reply) => {
    const { sceneId } = req.params as { sceneId: string };
    // Re-enqueue asset job for this scene
    return reply.code(202).send({ sceneId, status: "regenerating" });
  });
}
