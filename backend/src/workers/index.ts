import { logger } from "../logger.js";
import { QUEUES, makeWorker } from "../jobs/queue.js";
import { claimFeesJob } from "../jobs/claim-fees.js";
import { buyCurrencyJob } from "../jobs/buy-currency.js";
import { distributeJob } from "../jobs/distribute.js";
import { closeDb } from "../db.js";

/** Worker process entrypoint. One process boots all three queues and
 * relies on BullMQ's concurrency setting to fan out. Split into
 * separate processes if any single queue's throughput grows past what
 * one Node process can chew through. */
async function main() {
  const workers = [
    makeWorker(QUEUES.ClaimFees, claimFeesJob),
    makeWorker(QUEUES.BuyCurrency, buyCurrencyJob),
    makeWorker(QUEUES.Distribute, distributeJob),
  ];
  logger.info({ queues: Object.values(QUEUES) }, "bankpad workers ready");

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "shutting down workers");
    await Promise.allSettled(workers.map((w) => w.close()));
    await closeDb();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "worker boot failed");
  process.exit(1);
});
