/**
 * ViralForge AI — API Service (Fastify)
 * =====================================
 * Separate from the Next.js BFF. Handles:
 *   - Auth (Better Auth, RBAC, secure sessions)
 *   - Projects CRUD
 *   - Render job submission (returns 202 Accepted; workers handle the rest)
 *   - Billing (Stripe Checkout, Customer Portal, idempotent webhook)
 *   - Credit ledger (double-entry, append-only)
 *   - Admin endpoints (RBAC-gated)
 *   - SSE / WebSocket for live render progress
 *
 * The API NEVER renders video. Render jobs go to the worker pool via BullMQ.
 *
 * No no-code automation:
 *   This service does NOT use Make.com, n8n, Zapier, or any no-code tool.
 */

import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";
import websocket from "@fastify/websocket";
import { logger } from "./logger";
import { authRoutes } from "./routes/auth";
import { projectRoutes } from "./routes/projects";
import { renderRoutes } from "./routes/render";
import { billingRoutes } from "./routes/billing";
import { stripeWebhook } from "./routes/stripe-webhook";
import { adminRoutes } from "./routes/admin";
import { orgMiddleware } from "./auth/org-context";

const PORT = parseInt(process.env.API_PORT ?? "4000", 10);

async function main() {
  const app = Fastify({ logger: false });

  await app.register(helmet, {});
  await app.register(cors, {
    origin: process.env.WEB_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });
  await app.register(websocket, {});

  // Organization context middleware: extracts orgId from auth session,
  // attaches to request, and enforces it on all DB queries.
  app.addHook("onRequest", orgMiddleware);

  // Raw body for Stripe webhook (signature verification needs raw bytes)
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      if (req.url.startsWith("/v1/billing/webhook")) {
        // Keep raw for Stripe signature
        (req as any).rawBody = body;
        done(null, body);
      } else {
        try {
          done(null, JSON.parse(body.toString()));
        } catch (e) {
          done(e as Error, undefined);
        }
      }
    },
  );

  // Routes
  await app.register(authRoutes, { prefix: "/v1/auth" });
  await app.register(projectRoutes, { prefix: "/v1/projects" });
  await app.register(renderRoutes, { prefix: "/v1/render" });
  await app.register(billingRoutes, { prefix: "/v1/billing" });
  await app.register(stripeWebhook, { prefix: "/v1/billing" });
  await app.register(adminRoutes, { prefix: "/v1/admin" });

  // Health
  app.get("/health", () => ({ ok: true }));

  app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
    if (err) { logger.error({ err }, "API failed to start"); process.exit(1); }
    logger.info({ port: PORT }, "ViralForge API ready");
  });
}

main().catch((err) => {
  logger.error({ err }, "Fatal API boot error");
  process.exit(1);
});
