/**
 * Session verification — Better Auth session token lookup.
 * In production, integrates with Better Auth's session table.
 */

import type { FastifyRequest } from "fastify";

interface SessionInfo {
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
}

export async function verifySession(req: FastifyRequest): Promise<SessionInfo | null> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  // Production: look up session by token in db.session
  // const session = await db.session.findUnique({ where: { token } });
  // if (!session || session.expiresAt < new Date()) return null;
  // const membership = await db.membership.findFirst({ where: { userId: session.userId } });
  // return { userId: session.userId, organizationId: membership!.organizationId, role: membership!.role };

  // Stub: return a demo session
  return {
    userId: "u_01",
    organizationId: "org_01",
    role: "OWNER",
  };
}
