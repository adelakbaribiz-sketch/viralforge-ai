/**
 * Organization Context Middleware
 * ===============================
 * Extracts organizationId from the authenticated session, attaches it
 * to `request.orgId`, and propagates it to Prisma middleware so EVERY
 * query is automatically scoped to the current organization.
 *
 * This is defense-in-depth: even if a route forgets to filter by orgId,
 * Prisma middleware will add the WHERE clause. Postgres RLS is a third
 * layer of protection at the database level.
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "@viralforge/db";
import { verifySession } from "./sessions";

declare module "fastify" {
  interface FastifyRequest {
    orgId?: string;
    userId?: string;
    role?: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  }
}

const PUBLIC_PATHS = ["/v1/auth", "/v1/billing/webhook", "/health"];

export async function orgMiddleware(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (PUBLIC_PATHS.some((p) => req.url.startsWith(p))) return;

  const session = await verifySession(req);
  if (!session) {
    // Auth handled in route handlers
    return;
  }

  req.userId = session.userId;
  req.orgId = session.organizationId;
  req.role = session.role;

  // Set tenant context for Prisma middleware
  (db as any).__tenantContext = { organizationId: session.organizationId };
}
