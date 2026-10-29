/**
 * Worker Process Entry
 * ====================
 * Boots all 5 BullMQ worker queues:
 *   - ScriptWorker    (LLM → structured script)
 *   - AssetWorker     (asset planning + generation: AI video / AI image / stock)
 *   - VoiceWorker     (TTS with word timestamps)
 *   - RenderWorker    (Remotion + FFmpeg assembly)
 *   - QCWorker        (duration / black frames / audio / captions / safety / copyright)
 *
 * Reliability:
 *   - Exponential backoff retry (configurable per queue)
 *   - Dead-letter queue (jobs that exhaust retries are moved to DeadLetterJob table)
 *   - Idempotency: every job carries an idempotencyKey; re-running produces no
 *     duplicate output or double cost.
 *   - Priority queue: Pro+ organizations get higher BullMQ priority.
 *
 * No no-code automation:
 *   This file does NOT use Make.com, n8n, Zapier, or any no-code automation tool.
 *   All orchestration is implemented in TypeScript with BullMQ + Redis + PostgreSQL.
 */

import "dotenv/config";
import { ScriptWorker } from "./workers/script-worker";
import { AssetWorker } from "./workers/asset-worker";
import { VoiceWorker } from "./workers/voice-worker";
import { RenderWorker } from "./workers/render-worker";
import { QCWorker } from "./workers/qc-worker";
import { logger } from "./logger";
import { setupBullBoard } from "./bull-board";

async function main() {
  logger.info("Booting ViralForge AI worker pool...");

  const scriptWorker = new ScriptWorker();
  const assetWorker = new AssetWorker();
  const voiceWorker = new VoiceWorker();
  const renderWorker = new RenderWorker();
  const qcWorker = new QCWorker();

  await Promise.all([
    scriptWorker.start(),
    assetWorker.start(),
    voiceWorker.start(),
    renderWorker.start(),
    qcWorker.start(),
  ]);

  // Bull Board UI on :3010 (admin only)
  await setupBullBoard(3010);

  logger.info("All workers ready. Press Ctrl+C to stop.");

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down workers...");
    await Promise.all([
      scriptWorker.stop(),
      assetWorker.stop(),
      voiceWorker.stop(),
      renderWorker.stop(),
      qcWorker.stop(),
    ]);
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "Fatal worker boot error");
  process.exit(1);
});
