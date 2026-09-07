import { Queue, QueueEvents, Worker, type Job } from "bullmq";
import IORedis, { type Redis } from "ioredis";
import { config } from "../config.js";
import { logger } from "../logger.js";

let _redis: Redis | undefined;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new IORedis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    _redis.on("error", (err) => logger.error({ err }, "redis error"));
  }
  return _redis;
}

/** BullMQ queue names — kept as a const enum so job producers and workers
 * agree at compile time. */
export const QUEUES = {
  ClaimFees: "bp:claim-fees",
  BuyCurrency: "bp:buy-currency",
  Distribute: "bp:distribute",
} as const;
export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

/** Job payload for every reward-loop entrypoint: the launched token
 * address. The job pulls everything else it needs from the DB row for
 * that launch so replaying a stale job never uses stale parameters. */
export type ReserveLoopJob = { launchAddress: string };

const queues: Partial<Record<QueueName, Queue<ReserveLoopJob>>> = {};

export function getQueue(name: QueueName): Queue<ReserveLoopJob> {
  const existing = queues[name];
  if (existing) return existing;
  const q = new Queue<ReserveLoopJob>(name, { connection: getRedis() });
  queues[name] = q;
  return q;
}

/** Schedule a repeatable per-launch job with a stable jobId so restarts
 * do not double-add. */
export async function scheduleRepeatable(
  name: QueueName,
  launchAddress: string,
  everyMs: number,
): Promise<void> {
  const q = getQueue(name);
  await q.add(
    launchAddress,
    { launchAddress },
    {
      jobId: `${name}:${launchAddress.toLowerCase()}`,
      repeat: { every: everyMs },
      removeOnComplete: 500,
      removeOnFail: 500,
    },
  );
}

/** Remove a repeatable job (e.g. when a launch is paused or removed). */
export async function unscheduleRepeatable(
  name: QueueName,
  launchAddress: string,
  everyMs: number,
): Promise<void> {
  const q = getQueue(name);
  await q.removeRepeatable(launchAddress, { every: everyMs }, `${name}:${launchAddress.toLowerCase()}`);
}

export function makeWorker(
  name: QueueName,
  handler: (job: Job<ReserveLoopJob>) => Promise<void>,
): Worker<ReserveLoopJob> {
  const w = new Worker<ReserveLoopJob>(name, handler, {
    connection: getRedis(),
    concurrency: 4,
    lockDuration: 60_000, // one worker holds the launch's lock for up to 60s
  });
  w.on("failed", (job, err) =>
    logger.error({ err, queue: name, jobId: job?.id, data: job?.data }, "job failed"),
  );
  w.on("completed", (job) =>
    logger.debug({ queue: name, jobId: job.id, data: job.data }, "job ok"),
  );
  return w;
}

export function makeQueueEvents(name: QueueName): QueueEvents {
  return new QueueEvents(name, { connection: getRedis() });
}
