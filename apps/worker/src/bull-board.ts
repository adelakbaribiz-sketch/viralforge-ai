/**
 * Bull Board UI
 * ============
 * Admin-only dashboard for inspecting BullMQ queues, jobs, retries, and
 * the dead-letter queue. Mounted at port 3010 (only accessible internally).
 */

import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { QUEUES } from "./queues";
import { logger } from "./logger";

export async function setupBullBoard(port: number): Promise<void> {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");
  createBullBoard({
    queues: [
      new BullMQAdapter(QUEUES.scriptQueue),
      new BullMQAdapter(QUEUES.assetQueue),
      new BullMQAdapter(QUEUES.voiceQueue),
      new BullMQAdapter(QUEUES.renderQueue),
      new BullMQAdapter(QUEUES.qcQueue),
    ],
    serverAdapter,
  });

  const app = express();
  app.use("/admin/queues", serverAdapter.getRouter());
  // TODO: add auth middleware (admin only)

  app.listen(port, () => logger.info({ port }, "Bull Board ready at /admin/queues"));
}
