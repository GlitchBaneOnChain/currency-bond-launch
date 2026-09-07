import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../db.js";
import { isLaunchable, rewardCurrency } from "../../registry/currencies.js";
import { QUEUES, scheduleRepeatable } from "../../jobs/queue.js";
import { logger } from "../../logger.js";

const RegisterBody = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  name: z.string().min(2).max(40),
  ticker: z.string().regex(/^[A-Z0-9]{2,8}$/),
  emoji: z.string().max(4).optional(),
  description: z.string().max(280).default(""),
  rewardCurrencyCode: z.string(),
  feeWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  poolAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  lockerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  positionId: z.string().regex(/^\d+$/),
  launchTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  creatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  creatorTaxBps: z.number().int().min(0).max(500),
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  telegram: z.string().url().optional(),
});

export async function launchRoutes(app: FastifyInstance) {
  /** POST /launches/register — called by the frontend right after a
   * successful launchToken() tx. Records the launch and arms the reward
   * loop's repeatable jobs. Client-supplied currency codes are re-checked
   * against the backend allowlist here; a launch that names a currency
   * without an on-chain reward token is rejected.
   *
   * The endpoint does not sign anything on the user's behalf; every state
   * change here is off-chain metadata. */
  app.post("/launches/register", async (req, reply) => {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const data = parsed.data;

    const currency = rewardCurrency(data.rewardCurrencyCode);
    if (!currency || !isLaunchable(data.rewardCurrencyCode)) {
      return reply.code(400).send({ error: "Reward currency is not launchable" });
    }

    const existing = await db.launch.findUnique({ where: { address: data.address } });
    if (existing) {
      return reply.code(200).send({ launch: existing, existed: true });
    }

    const launch = await db.launch.create({
      data: {
        address: data.address,
        name: data.name,
        ticker: data.ticker,
        emoji: data.emoji ?? "🏦",
        description: data.description,
        rewardCurrencyCode: data.rewardCurrencyCode,
        rewardTokenAddress: currency.address,
        feeWallet: data.feeWallet,
        poolAddress: data.poolAddress,
        lockerAddress: data.lockerAddress,
        positionId: BigInt(data.positionId),
        launchTxHash: data.launchTxHash,
        creatorAddress: data.creatorAddress,
        creatorTaxBps: data.creatorTaxBps,
        website: data.website ?? null,
        twitter: data.twitter ?? null,
        telegram: data.telegram ?? null,
      },
    });

    // Arm the reward-loop cadence for this launch. Repeatable jobs are
    // idempotent by jobId, so re-registering the same address is safe.
    await scheduleRepeatable(QUEUES.ClaimFees, launch.address, 60_000);
    await scheduleRepeatable(QUEUES.BuyCurrency, launch.address, 600_000);
    await scheduleRepeatable(QUEUES.Distribute, launch.address, 600_000);

    logger.info({ launch: launch.address }, "launch registered and armed");
    return { launch, existed: false };
  });

  /** GET /launches/:address — the frontend's read path. Returns the
   * off-chain metadata; live numbers (burned, distributed, holders) come
   * from the chain via viem in the token detail page. */
  app.get<{ Params: { address: string } }>("/launches/:address", async (req, reply) => {
    const addr = req.params.address;
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      return reply.code(400).send({ error: "Invalid address" });
    }
    const launch = await db.launch.findUnique({ where: { address: addr } });
    if (!launch) return reply.code(404).send({ error: "Not found" });
    return { launch };
  });
}
