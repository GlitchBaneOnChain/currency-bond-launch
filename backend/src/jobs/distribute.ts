import type { Job } from "bullmq";
import type { Address } from "viem";
import { db } from "../db.js";
import { logger } from "../logger.js";
import { getPublicClient } from "../chain/clients.js";
import { distributorAbi, launcherTokenAbi } from "../pons/abis.js";
import { config } from "../config.js";
import { loadOperatorWallet } from "../lib/operator.js";
import type { ReserveLoopJob } from "./queue.js";

/** Every ~10 minutes (staggered off the buy job): distribute the parked
 * reward-token balance to eligible holders.
 *
 * Holder discovery is still an O(events) scan over the token's Transfer
 * log; swap for the indexer's Holder table when that lands. */
export async function distributeJob(job: Job<ReserveLoopJob>): Promise<void> {
  if (config.BANKPAD_PAUSE) return;
  const launch = await db.launch.findUnique({ where: { address: job.data.launchAddress } });
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
  if (pending === 0n) return;

  const holders = await scanTransferHolders(token);
  if (holders.length === 0) return;

  // On-chain eligibility filter. Batched to keep RPC round-trips down.
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
  if (eligible.length === 0) return;

  const { request } = await publicClient.simulateContract({
    address: distributor,
    abi: distributorAbi,
    functionName: "distribute",
    args: [eligible],
    account: config.BANKPAD_OPERATOR_ADDRESS as Address,
  });

  if (!config.BANKPAD_OPERATOR_ADDRESS) {
    logger.info(
      { launch: launch.address, pending: pending.toString(), holders: eligible.length },
      "would broadcast distribute (no operator address configured)",
    );
    return;
  }

  const wallet = await loadOperatorWallet(config.BANKPAD_OPERATOR_ADDRESS as Address).catch(
    (err) => {
      logger.error({ err, launch: launch.address }, "operator wallet load failed");
      return undefined;
    },
  );
  if (!wallet) return;

  const txHash = await wallet.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  // Balance snapshot so the DB payout rows carry each holder's share.
  const supply = (await publicClient.readContract({
    address: token,
    abi: launcherTokenAbi,
    functionName: "totalSupply",
  })) as bigint;
  const balances = await Promise.all(
    eligible.map(
      (h) =>
        publicClient.readContract({
          address: token,
          abi: launcherTokenAbi,
          functionName: "balanceOf",
          args: [h],
        }) as Promise<bigint>,
    ),
  );
  const eligibleTotal = balances.reduce((a, b) => a + b, 0n);

  const batch = await db.payoutBatch.create({
    data: {
      launchId: launch.id,
      txHash,
      totalPaid: pending.toString(),
      eligibleCount: eligible.length,
      eligibleSupply: eligibleTotal.toString(),
      blockNumber: receipt.blockNumber,
    },
  });

  // One Payout row per holder for the UI's dividend history. Batched.
  const rows = eligible.map((holder, i) => {
    const bal = balances[i] ?? 0n;
    const share = eligibleTotal === 0n ? 0n : (pending * bal) / eligibleTotal;
    return { batchId: batch.id, holder, amount: share.toString() };
  });
  if (rows.length > 0) {
    await db.payout.createMany({ data: rows });
  }

  logger.info(
    {
      launch: launch.address,
      txHash,
      pending: pending.toString(),
      holders: eligible.length,
      totalSupply: supply.toString(),
    },
    "distribute broadcast",
  );
}

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
