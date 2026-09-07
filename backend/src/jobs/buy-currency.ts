import type { Job } from "bullmq";
import type { Address } from "viem";
import { db } from "../db.js";
import { logger } from "../logger.js";
import { getPublicClient } from "../chain/clients.js";
import { distributorAbi } from "../pons/abis.js";
import { config } from "../config.js";
import { rewardCurrency } from "../registry/currencies.js";
import type { ReserveLoopJob } from "./queue.js";

/** Every ~10 minutes: for each active launch with parked WETH, swap it
 * into the launch's reward currency on Uniswap V3.
 *
 * Slippage floor and price-impact cap: the operator computes them from
 * the current pool quote before calling `buyRewards`. This job skeleton
 * validates the inputs and simulates; the broadcast lives behind the
 * operator wallet loader (see loadOperatorWallet in lib/operator.ts). */
export async function buyCurrencyJob(job: Job<ReserveLoopJob>): Promise<void> {
  if (config.BANKPAD_PAUSE) return;
  const launch = await db.launch.findUnique({
    where: { address: job.data.launchAddress },
  });
  if (!launch) throw new Error(`Unknown launch ${job.data.launchAddress}`);
  if (launch.paused) return;
  if (!launch.distributor) return;

  const currency = rewardCurrency(launch.rewardCurrencyCode);
  if (!currency) {
    logger.error(
      { launch: launch.address, code: launch.rewardCurrencyCode },
      "launch names a currency not on the backend allowlist; skipping buy",
    );
    return;
  }

  const distributor = launch.distributor as Address;
  const publicClient = getPublicClient();

  // Read the distributor's WETH balance implicitly by looking at what
  // buyRewards would swap. For the first cut we hardcode nothing —
  // Slice 5b wires the actual amount + slippage math against the pool.
  logger.info(
    { launch: launch.address, distributor, currency: currency.code },
    "buy-currency job tick",
  );

  // Placeholder simulate to catch config drift early:
  try {
    await publicClient.readContract({
      address: distributor,
      abi: distributorAbi,
      functionName: "pendingRewards",
    });
  } catch (err) {
    logger.error({ err, launch: launch.address }, "distributor read failed");
    throw err;
  }
}
