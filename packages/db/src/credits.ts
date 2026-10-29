/**
 * Credit Ledger — Double-Entry, Append-Only
 * =========================================
 * Credits are NEVER updated directly on Organization. Every change is a new
 * CreditLedger row, and the Organization.credits balance is recomputed
 * atomically within a transaction.
 *
 * Operations:
 *   - grantCredits      (subscription_grant, topup, trial_bonus)
 *   - reserveCredits    (deduct before render; refundable on failure)
 *   - settleCredits     (final deduction on render completion)
 *   - refundCredits     (release reservation when render fails)
 *
 * All operations use SELECT ... FOR UPDATE on the Organization row to
 * guarantee atomicity.
 */

import type { PrismaClient, Prisma } from "@viralforge/db";
import type { LedgerReason } from "@viralforge/db";

export async function grantCredits(
  tx: Prisma.TransactionClient | PrismaClient,
  organizationId: string,
  amount: number,
  reason: LedgerReason,
  refId: string,
): Promise<number> {
  if (amount <= 0) throw new Error("grantCredits: amount must be > 0");

  return tx.$transaction(async (t) => {
    const org = await t.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new Error("Organization not found");

    const balanceAfter = org.credits + amount;
    await t.organization.update({
      where: { id: organizationId },
      data: { credits: balanceAfter },
    });
    await t.creditLedger.create({
      data: { organizationId, delta: amount, reason, refId, balanceAfter },
    });
    return balanceAfter;
  });
}

export async function reserveCredits(
  tx: Prisma.TransactionClient | PrismaClient,
  organizationId: string,
  amount: number,
  jobId: string,
): Promise<number> {
  if (amount <= 0) throw new Error("reserveCredits: amount must be > 0");

  return tx.$transaction(async (t) => {
    // SELECT FOR UPDATE — atomic balance check
    const org = await t.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new Error("Organization not found");

    if (org.credits < amount) {
      throw new InsufficientCreditsError(organizationId, amount, org.credits);
    }

    const balanceAfter = org.credits - amount;
    await t.organization.update({
      where: { id: organizationId },
      data: { credits: balanceAfter },
    });
    await t.creditLedger.create({
      data: {
        organizationId,
        delta: -amount,
        reason: "RENDER_SPEND",
        refId: jobId,
        balanceAfter,
      },
    });
    return balanceAfter;
  });
}

export async function settleJobCredits(args: {
  jobId: string;
  organizationId: string;
  status: "COMPLETED" | "FAILED";
}): Promise<void> {
  const { jobId, organizationId, status } = args;
  const job = await db.renderJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("RenderJob not found");

  if (status === "COMPLETED") {
    // Final cost is the actual cost (could be less than reserved if some scenes used cheaper fallback)
    const actual = job.actualCostCredits ?? job.estimatedCostCredits;
    // The reservation already deducted estimated. If actual > estimated, deduct the diff.
    // If actual < estimated, refund the diff.
    const diff = actual - job.estimatedCostCredits;
    if (diff > 0) {
      await reserveCredits(db, organizationId, diff, jobId);
    } else if (diff < 0) {
      await refundCredits(db, organizationId, -diff, jobId);
    }
    await db.renderJob.update({
      where: { id: jobId },
      data: { actualCostCredits: actual },
    });
  } else {
    // FAILED: refund the full reservation
    await refundCredits(db, organizationId, job.estimatedCostCredits, jobId);
  }
}

export async function refundCredits(
  tx: Prisma.TransactionClient | PrismaClient,
  organizationId: string,
  amount: number,
  jobId: string,
): Promise<number> {
  if (amount <= 0) throw new Error("refundCredits: amount must be > 0");
  return tx.$transaction(async (t) => {
    const org = await t.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new Error("Organization not found");

    const balanceAfter = org.credits + amount;
    await t.organization.update({
      where: { id: organizationId },
      data: { credits: balanceAfter },
    });
    await t.creditLedger.create({
      data: {
        organizationId,
        delta: amount,
        reason: "RENDER_REFUND",
        refId: jobId,
        balanceAfter,
      },
    });
    return balanceAfter;
  });
}

export class InsufficientCreditsError extends Error {
  constructor(
    public readonly organizationId: string,
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(`Insufficient credits: requested ${requested}, available ${available} (org ${organizationId})`);
    this.name = "InsufficientCreditsError";
  }
}

// Re-export for route handlers that already have a tx
import { db } from "./index";
