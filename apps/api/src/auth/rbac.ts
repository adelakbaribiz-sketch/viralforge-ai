/**
 * RBAC — Role-Based Access Control
 * ===============================
 * Owner (full)  · Admin (manage members, billing) · Editor (create/edit) · Viewer (read-only)
 *
 * Every protected route wraps its handler in `requireRole(...)`.
 */

import type { FastifyRequest, FastifyReply } from "fastify";

export type Role = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function requireRole(min: Role) {
  return (req: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    if (!req.role) {
      done(new Error("UNAUTHORIZED"));
      return;
    }
    if (ROLE_RANK[req.role] < ROLE_RANK[min]) {
      done(new Error("FORBIDDEN"));
      return;
    }
    done();
  };
}

export function canEdit(role: Role | undefined): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK.EDITOR;
}

export function canManageOrg(role: Role | undefined): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK.ADMIN;
}

export function isOwner(role: Role | undefined): boolean {
  return role === "OWNER";
}
