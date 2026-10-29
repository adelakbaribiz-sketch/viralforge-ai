import type { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (_req, reply) => reply.code(501).send({ error: "not_implemented_in_demo" }));
  app.post("/register", async (_req, reply) => reply.code(501).send({ error: "not_implemented_in_demo" }));
  app.post("/logout", async (_req, reply) => reply.code(501).send({ error: "not_implemented_in_demo" }));
  app.get("/me", async (_req, reply) => reply.send({ user: { id: "u_01", email: "sina@viralforge.ai", name: "Sina Karimi" } }));
}
