/**
 * Webhook Dispatcher
 * =================
 * Sends signed (HMAC-SHA256) outgoing webhooks to organization endpoints.
 * Records last response code + last sent timestamp.
 */

import { createHmac } from "node:crypto";
import { db } from "@viralforge/db";
import { logger } from "./logger";

export async function fireWebhook(organizationId: string, event: string, payload: unknown): Promise<void> {
  const hooks = await db.webhook.findMany({
    where: { organizationId, active: true, events: { has: event } },
  });

  for (const hook of hooks) {
    try {
      const body = JSON.stringify({ event, payload, ts: Date.now() });
      const sig = createHmac("sha256", hook.secret).update(body).digest("hex");

      const res = await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VF-Signature": sig,
          "X-VF-Event": event,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });

      await db.webhook.update({
        where: { id: hook.id },
        data: { lastResponse: res.status, lastSentAt: new Date() },
      });

      logger.info({ hook: hook.id, event, status: res.status }, "webhook:sent");
    } catch (err) {
      logger.error({ err, hook: hook.id, event }, "webhook:failed");
    }
  }
}
