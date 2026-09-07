import type { Job } from "bullmq";
import type { Address } from "viem";
import { db } from "../db.js";
import { logger } from "../logger.js";
import { getPublicClient } from "../chain/clients.js";
import { distributorAbi, launcherTokenAbi } from "../pons/abis.js";
import { config } from "../config.js";
import type { ReserveLoopJob } from "./queue.js";

/** Every ~10 minutes (staggered off the buy job): distribute the parked
 * reward-token balance to eligible holders.
 *
 * The holder snapshot is not yet indexed by this repo — a proper indexer
 * job that folds `Transfer` events into a `Holder` table is Slice 5b.
 * For now the job:
 *   1. Reads `pendingRewards` on the distributor. If zero, no-op.
 *   2. Reads the token's holder set from Transfer events since genesis.
 *      This is O(events) and only tolerable for small launches; the
 *      indexer replaces it with an O(1) DB read.
 *   3. Filters via `distributor.isEligible(holder)` on-chain and calls
 *      `distribute(holders)` with the passing set.
 *
 * The broadcast is stubbed the same way as claim-fees for now; the
 * simulate + eligibility scan runs every tick so we know the loop
 * would fire cleanly. */
export async function distributeJob(job: Job<ReserveLoopJob>): Promise<void> {
  if (config.BANKPAD_PAUSE) return;
  const launch = await db.launch.findUnique({
    where: { address: job.data.launchAddress },
  });
  if (!launch) throw new Error(`Unknown launch ${job.data.launchAddress}`);
  if (launch.paused) return;
  if (!launch.distributor) return;

  const distributor = launch.distributor as Address;
  const token = launch.address as Address;
  const publicClient = getPublicClient();

  const pending = (await publicClient.readContract({
    address: distributor,
    abi: distributorAbi,
    functionName: "pendingRewards",
  })) as bigint;
  if (pending === 0n) {
    logger.debug({ launch: launch.address }, "no rewards pending; skip distribute");
    return;
  }

  // Naive scan for the first cut. Replace with the indexer's `Holder`
  // table read once Slice 5b lands.
  const holders = await scanTransferHolders(token);
  if (holders.length === 0) {
    logger.warn({ launch: launch.address }, "no holders found; skip distribute");
    return;
  }

  // On-chain eligibility filter. `isEligible` costs one storage read per
  // call — cheap enough for the first cut.
  const eligible: Address[] = [];
  for (const h of holders) {
    const ok = (await publicClient.readContract({
      address: distributor,
      abi: distributorAbi,
      functionName: "isEligible",
      args: [h],
    })) as boolean;
    if (ok) eligible.push(h);
  }
  if (eligible.length === 0) {
    logger.warn({ launch: launch.address }, "no eligible holders; skip distribute");
    return;
  }

  try {
    await publicClient.simulateContract({
      address: distributor,
      abi: distributorAbi,
      functionName: "distribute",
      args: [eligible],
    });
  } catch (err) {
    logger.error(
      { err, launch: launch.address, distributor, holders: eligible.length },
      "distribute simulation reverted",
    );
    throw err;
  }

  logger.info(
    { launch: launch.address, distributor, pending: pending.toString(), holders: eligible.length },
    "would broadcast distribute",
  );
}

/** O(events) holder scan. Kept isolated so the indexer swap is one file. */
async function scanTransferHolders(token: Address): Promise<Address[]> {
  const publicClient = getPublicClient();
  const logs = await publicClient.getLogs({
    address: token,
    event: launcherTokenAbi.find((e) => e.type === "event" && e.name === "Transfer") as never,
    fromBlock: "earliest",
    toBlock: "latest",
  });
  const seen = new Set<string>();
  for (const log of logs) {
    const args = (log as unknown as { args: { from?: Address; to?: Address } }).args;
    if (args?.to) seen.add(args.to.toLowerCase());
    if (args?.from) seen.add(args.from.toLowerCase());
  }
  seen.delete("0x0000000000000000000000000000000000000000");
  return [...seen] as Address[];
}
