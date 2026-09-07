import type { Job } from "bullmq";
import type { Address } from "viem";
import { db } from "../db.js";
import { logger } from "../logger.js";
import { getPublicClient } from "../chain/clients.js";
import { distributorAbi } from "../pons/abis.js";
import { config } from "../config.js";
import { loadOperatorWallet } from "../lib/operator.js";
import type { ReserveLoopJob } from "./queue.js";

/** Every 60 seconds: for each active launch with a distributor, check
 * if the V3 position has accrued any fees and call `claimAndBurn`.
 *
 * `claimAndBurn` is permissionless — the memecoin always goes to the
 * burn address, so no key would enable value extraction. We use the
 * operator anyway to route gas billing through one wallet. */
export async function claimFeesJob(job: Job<ReserveLoopJob>): Promise<void> {
  if (config.BANKPAD_PAUSE) {
    logger.warn({ launch: job.data.launchAddress }, "global pause: skipping claim");
    return;
  }
  const launch = await db.launch.findUnique({ where: { address: job.data.launchAddress } });
  if (!launch) throw new Error(`Unknown launch ${job.data.launchAddress}`);
  if (launch.paused) return;
  if (!launch.distributor) return;

  const distributor = launch.distributor as Address;
  const publicClient = getPublicClient();

  // Read pending fees. Skip the write entirely when both sides are zero.
  const [memeOwed, wethOwed] = (await publicClient.readContract({
    address: distributor,
    abi: distributorAbi,
    functionName: "pendingFees",
  })) as [bigint, bigint];
  if (memeOwed === 0n && wethOwed === 0n) return;

  // Simulate first so a revert surfaces here rather than after broadcast.
  const { request } = await publicClient.simulateContract({
    address: distributor,
    abi: distributorAbi,
    functionName: "claimAndBurn",
    account: config.BANKPAD_OPERATOR_ADDRESS as Address,
  });

  // Real broadcast requires the operator's encrypted key to be seeded.
  // If it's not there yet, log the simulate result and bail cleanly.
  if (!config.BANKPAD_OPERATOR_ADDRESS) {
    logger.info(
      { launch: launch.address, memeOwed: memeOwed.toString(), wethOwed: wethOwed.toString() },
      "would broadcast claimAndBurn (no operator address configured)",
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

  await db.feeClaim.create({
    data: {
      launchId: launch.id,
      txHash,
      memeBurned: memeOwed.toString(),
      wethReceived: wethOwed.toString(),
      blockNumber: receipt.blockNumber,
    },
  });

  logger.info(
    {
      launch: launch.address,
      txHash,
      memeBurned: memeOwed.toString(),
      wethReceived: wethOwed.toString(),
    },
    "claimAndBurn broadcast",
  );
}
