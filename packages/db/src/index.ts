/**
 * Prisma Client Singleton
 * ======================
 * Initializes PrismaClient once per process and registers the tenant
 * middleware that automatically injects organizationId into every query.
 *
 * The middleware reads the current tenant context from a global symbol,
 * which is set by the API layer's org-context middleware.
 */

import { PrismaClient } from "@prisma/client";

export const TENANT_SYMBOL = Symbol.for("viralforge.tenant");

export const db = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});

// Tenant-scoping middleware: every find/update/delete on tenant-scoped
// models is automatically filtered by organizationId from the context.
// This is defense-in-depth — API routes ALSO filter, and Postgres RLS
// enforces a third layer at the database level.
const TENANT_MODELS = new Set([
  "project", "scene", "asset", "renderJob", "creditLedger",
  "subscription", "brandKit", "apiKey", "webhook", "auditLog",
  "moderationItem", "providerUsage",
]);

// @ts-expect-error — Prisma middleware signature
db.$use(async (params, next) => {
  const ctx = (globalThis as any)[TENANT_SYMBOL] as { organizationId: string } | undefined;
  if (ctx?.organizationId && TENANT_MODELS.has(params.model)) {
    if (params.action === "findMany" || params.action === "findFirst" || params.action === "findUnique") {
      params.args = params.args ?? {};
      params.args.where = { ...params.args.where, organizationId: ctx.organizationId };
    } else if (params.action === "create") {
      params.args = params.args ?? {};
      params.args.data = { ...params.args.data, organizationId: ctx.organizationId };
    } else if (params.action === "createMany") {
      params.args = params.args ?? {};
      params.args.data = Array.isArray(params.args.data)
        ? params.args.data.map((d: any) => ({ ...d, organizationId: ctx.organizationId }))
        : { ...params.args.data, organizationId: ctx.organizationId };
    } else if (params.action === "update" || params.action === "updateMany" || params.action === "delete" || params.action === "deleteMany") {
      params.args = params.args ?? {};
      params.args.where = { ...params.args.where, organizationId: ctx.organizationId };
    }
  }
  return next(params);
});

export function setTenantContext(organizationId: string): void {
  (globalThis as any)[TENANT_SYMBOL] = { organizationId };
}

export function clearTenantContext(): void {
  delete (globalThis as any)[TENANT_SYMBOL];
}

export { PrismaClient } from "@prisma/client";
export type { Prisma } from "@prisma/client";
