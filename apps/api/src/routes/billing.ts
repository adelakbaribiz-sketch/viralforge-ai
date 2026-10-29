import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { db } from "@viralforge/db";
import { requireRole } from "../auth/rbac";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-10-30.acacia" });

const PRICE_MAP: Record<string, string> = {
  CREATOR: process.env.STRIPE_PRICE_CREATOR!,
  PRO: process.env.STRIPE_PRICE_PRO!,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS!,
  AGENCY: process.env.STRIPE_PRICE_AGENCY!,
};

export async function billingRoutes(app: FastifyInstance) {
  // Start Checkout session
  app.post("/checkout", { preHandler: requireRole("ADMIN") }, async (req, reply) => {
    const { plan } = req.body as { plan: string };
    const priceId = PRICE_MAP[plan];
    if (!priceId) return reply.code(400).send({ error: "INVALID_PLAN" });

    const sub = await db.subscription.findUnique({ where: { organizationId: req.orgId! } });
    if (!sub?.stripeCustomerId) return reply.code(400).send({ error: "NO_CUSTOMER" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: sub.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { organizationId: req.orgId, plan },
      success_url: `${process.env.WEB_ORIGIN}/billing?status=success`,
      cancel_url: `${process.env.WEB_ORIGIN}/billing?status=cancel`,
    });
    return reply.send({ url: session.url });
  });

  // Customer Portal (manage subscription, update card, cancel)
  app.post("/portal", { preHandler: requireRole("ADMIN") }, async (req, reply) => {
    const sub = await db.subscription.findUnique({ where: { organizationId: req.orgId! } });
    if (!sub?.stripeCustomerId) return reply.code(400).send({ error: "NO_CUSTOMER" });

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.WEB_ORIGIN}/billing`,
    });
    return reply.send({ url: session.url });
  });

  // Credit ledger (append-only, double-entry)
  app.get("/ledger", { preHandler: requireRole("VIEWER") }, async (req, reply) => {
    const entries = await db.creditLedger.findMany({
      where: { organizationId: req.orgId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return reply.send({ entries });
  });

  // Top-up credits (one-off Stripe Checkout)
  app.post("/topup", { preHandler: requireRole("ADMIN") }, async (req, reply) => {
    const { credits } = req.body as { credits: number };
    const sub = await db.subscription.findUnique({ where: { organizationId: req.orgId! } });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: sub?.stripeCustomerId,
      line_items: [{ price_data: { currency: "usd", product_data: { name: `${credits} credits` }, unit_amount: credits * 0.05 * 100 }, quantity: 1 }],
      metadata: { organizationId: req.orgId, credits: String(credits), type: "topup" },
      success_url: `${process.env.WEB_ORIGIN}/billing?status=topup`,
      cancel_url: `${process.env.WEB_ORIGIN}/billing?status=cancel`,
    });
    return reply.send({ url: session.url });
  });
}
