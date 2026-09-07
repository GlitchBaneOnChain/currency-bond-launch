import type { Job } from "bullmq";
import type { Address } from "viem";
import { db } from "../db.js";
import { logger } from "../logger.js";
import { getPublicClient } from "../chain/clients.js";
import { distributorAbi } from "../pons/abis.js";
import { config } from "../config.js";
import type { ReserveLoopJob } from "./queue.js";

/** Every 60 seconds: for each active launch, check if the V3 position has
 * accrued any fees. If it has, call `claimAndBurn` on the distributor.
 *
 * The distributor's `claimAndBurn` is permissionless — anyone can call
 * it and the memecoin portion always goes to the burn address, so the
 * job doesn't need the operator key here. We use the operator anyway
 * to keep a single billing address for gas. */
export async function claimFeesJob(job: Job<ReserveLoopJob>): Promise<void> {
  if (config.BANKPAD_PAUSE) {
    logger.warn({ launch: job.data.launchAddress }, "global pause: skipping claim");
    return;
  }
  const launch = await db.launch.findUnique({
    where: { address: job.data.launchAddress },
  });
  if (!launch) throw new Error(`Unknown launch ${job.data.launchAddress}`);
  if (launch.paused) {
    logger.info({ launch: launch.address }, "launch paused: skipping claim");
    return;
  }
  if (!launch.distributor) {
    logger.debug({ launch: launch.address }, "no distributor deployed yet: skipping claim");
    return;
  }

  const distributor = launch.distributor as Address;
  const publicClient = getPublicClient();

  // Read pending fees on the position. If both sides are zero, no-op and
  // save the gas / RPC round-trip.
  const [memeOwed, wethOwed] = (await publicClient.readContract({
    address: distributor,
    abi: distributorAbi,
    functionName: "pendingFees",
  })) as [bigint, bigint];
  if (memeOwed === 0n && wethOwed === 0n) {
    logger.debug({ launch: launch.address }, "no fees pending");
    return;
  }

  // Simulate first so a revert surfaces here, not after a broadcast.
  try {
    await publicClient.simulateContract({
      address: distributor,
      abi: distributorAbi,
      functionName: "claimAndBurn",
    });
  } catch (err) {
    logger.error(
      { err, launch: launch.address, distributor, memeOwed, wethOwed },
      "claimAndBurn simulation reverted",
    );
    throw err;
  }

  // Real broadcast lives behind loadOperatorWallet + writeContract; kept
  // as an explicit follow-up so the first backend PR ships without
  // requiring a funded operator wallet on Robinhood Chain yet. Persist
  // the observation so ops can see the loop is running.
  logger.info(
    { launch: launch.address, distributor, memeOwed: memeOwed.toString(), wethOwed: wethOwed.toString() },
    "would broadcast claimAndBurn",
  );
}
