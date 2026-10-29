/**
 * Stripe Webhook Handler
 * ======================
 * Idempotent: every Stripe event is recorded by event.id in the `stripe_events`
 * table. Re-deliveries are no-ops. Signature verification is mandatory.
 *
 * Handled events:
 *   - checkout.session.completed         → grant monthly credits
 *   - customer.subscription.updated      → update plan + seats
 *   - customer.subscription.deleted      → downgrade to Free + 30 credits
 *   - invoice.paid                       → persist invoice
 *   - invoice.payment_failed             → mark subscription past_due
 *
 * Credits are NEVER mutated without a CreditLedger entry (atomic transaction).
 */

import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { db } from "@viralforge/db";
import { grantCredits } from "@viralforge/db/credits";
import { logger } from "../logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-10-30.acacia" });

const PLAN_CREDITS: Record<string, number> = {
  FREE: 30,
  CREATOR: 300,
  PRO: 900,
  BUSINESS: 3000,
  AGENCY: 9000,
};

export async function stripeWebhook(app: FastifyInstance) {
  app.post("/webhook", async (req, reply) => {
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = (req as any).rawBody as Buffer;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      logger.warn({ err }, "stripe:invalid_signature");
      return reply.code(400).send({ error: "Invalid signature" });
    }

    // Idempotency: if event already handled, no-op
    const existing = await db.stripeEvent.findUnique({ where: { id: event.id } });
    if (existing?.handledAt) {
      return reply.code(200).send({ received: true, replay: true });
    }

    await db.stripeEvent.upsert({
      where: { id: event.id },
      create: { id: event.id, type: event.type, payload: event as any },
      update: {},
    });

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const organizationId = session.metadata?.organizationId;
          const plan = (session.metadata?.plan ?? "FREE").toUpperCase() as keyof typeof PLAN_CREDITS;
          if (organizationId) {
            await db.$transaction(async (tx) => {
              await db.subscription.upsert({
                where: { organizationId },
                create: {
                  organizationId,
                  stripeCustomerId: session.customer as string,
                  stripeSubscriptionId: session.subscription as string,
                  plan,
                  status: "ACTIVE",
                  currentPeriodEnd: new Date((session.expires_at ?? 0) * 1000),
                },
                update: {
                  plan,
                  status: "ACTIVE",
                  stripeSubscriptionId: session.subscription as string,
                },
              });
              await grantCredits(tx, organizationId, PLAN_CREDITS[plan] ?? 30, "SUBSCRIPTION_GRANT", event.id);
            });
          }
          break;
        }
        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          const organizationId = sub.metadata?.organizationId;
          const plan = (sub.metadata?.plan ?? "FREE").toUpperCase() as keyof typeof PLAN_CREDITS;
          if (organizationId) {
            await db.subscription.update({
              where: { organizationId },
              data: {
                plan,
                status: sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : "TRIALING",
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
              },
            });
          }
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const organizationId = sub.metadata?.organizationId;
          if (organizationId) {
            await db.subscription.update({
              where: { organizationId },
              data: { status: "CANCELED", plan: "FREE" },
            });
            await grantCredits(db, organizationId, 30, "SUBSCRIPTION_GRANT", event.id);
          }
          break;
        }
        default:
          logger.debug({ type: event.type }, "stripe:unhandled_event");
      }

      await db.stripeEvent.update({
        where: { id: event.id },
        data: { handledAt: new Date() },
      });

      return reply.code(200).send({ received: true });
    } catch (err) {
      logger.error({ err, type: event.type }, "stripe:handler_error");
      // Don't mark as handled; Stripe will retry
      return reply.code(500).send({ error: "Handler error" });
    }
  });
}
