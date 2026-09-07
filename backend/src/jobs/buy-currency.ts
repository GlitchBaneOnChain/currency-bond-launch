import type { Job } from "bullmq";
import type { Address, Log } from "viem";
import { decodeEventLog } from "viem";
import { db } from "../db.js";
import { logger } from "../logger.js";
import { getPublicClient } from "../chain/clients.js";
import { distributorAbi } from "../pons/abis.js";
import { v3PoolAbi } from "../pons/uniswap.js";
import { config } from "../config.js";
import { rewardCurrency } from "../registry/currencies.js";
import { findBestRewardPool, minOutFromSpot } from "../registry/depth.js";
import { loadOperatorWallet } from "../lib/operator.js";
import type { ReserveLoopJob } from "./queue.js";

/** Slippage cap in bps for the WETH -> reward swap. Adjustable via
 * SECURITY.md → circuit breakers when needed. Default 50 = 0.5%. */
const SLIPPAGE_BPS = 50;

/** Fraction of the parked WETH the buy job spends per tick (bps).
 * 5000 = 50%; combined with the 10-minute cadence this keeps a
 * single unlucky quote from draining the balance. */
const SPEND_FRACTION_BPS = 5_000;

export async function buyCurrencyJob(job: Job<ReserveLoopJob>): Promise<void> {
  if (config.BANKPAD_PAUSE) return;
  const launch = await db.launch.findUnique({ where: { address: job.data.launchAddress } });
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
  const weth = config.BANKPAD_WETH as Address;
  const publicClient = getPublicClient();

  // Read the distributor's parked WETH balance. Nothing to buy = no-op.
  const wethBalance = (await publicClient.readContract({
    address: weth,
    abi: [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ] as const,
    functionName: "balanceOf",
    args: [distributor],
  })) as bigint;
  if (wethBalance === 0n) return;

  // Pick the deepest fee tier for WETH <-> reward.
  const pool = await findBestRewardPool(currency);
  if (!pool) {
    logger.warn(
      { launch: launch.address, currency: currency.code },
      "no live WETH pool for currency; skipping",
    );
    return;
  }

  // Enforce the currency's minimum pool-depth floor. Approximated here as
  // liquidity scaled by the currency's decimals; the number needs a real
  // quote against a USD oracle before it becomes precise, but as a
  // relative measure it catches near-empty pools.
  const approxDepth = Number(pool.liquidity) / 10 ** currency.decimals;
  if (approxDepth < currency.minPoolDepthUsd) {
    logger.warn(
      {
        launch: launch.address,
        currency: currency.code,
        depth: approxDepth,
        floor: currency.minPoolDepthUsd,
      },
      "pool below depth floor; skipping buy",
    );
    return;
  }

  // Sqrt price for slippage math.
  const slot0 = (await publicClient.readContract({
    address: pool.address,
    abi: v3PoolAbi,
    functionName: "slot0",
  })) as readonly [bigint, number, number, number, number, number, boolean];
  const sqrtPriceX96 = slot0[0];

  const token0 = (await publicClient.readContract({
    address: pool.address,
    abi: v3PoolAbi,
    functionName: "token0",
  })) as Address;
  const wethIsToken0 = token0.toLowerCase() === weth.toLowerCase();

  const amountIn = (wethBalance * BigInt(SPEND_FRACTION_BPS)) / 10_000n;
  const amountOutMin = minOutFromSpot(amountIn, sqrtPriceX96, wethIsToken0, SLIPPAGE_BPS);
  if (amountOutMin === 0n) {
    logger.warn(
      { launch: launch.address, amountIn: amountIn.toString() },
      "computed zero amountOutMin; pool price may be misconfigured",
    );
    return;
  }

  // Simulate against the distributor before broadcasting.
  const { request } = await publicClient.simulateContract({
    address: distributor,
    abi: distributorAbi,
    functionName: "buyRewards",
    args: [amountIn, amountOutMin, pool.fee],
    account: config.BANKPAD_OPERATOR_ADDRESS as Address,
  });

  if (!config.BANKPAD_OPERATOR_ADDRESS) {
    logger.info(
      {
        launch: launch.address,
        amountIn: amountIn.toString(),
        amountOutMin: amountOutMin.toString(),
        fee: pool.fee,
      },
      "would broadcast buyRewards (no operator address configured)",
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

  // Pull the actual amountOut from the RewardsBought event.
  const rewardsOut = decodeRewardsOut(receipt.logs, distributor);

  await db.currencyBuy.create({
    data: {
      launchId: launch.id,
      txHash,
      wethIn: amountIn.toString(),
      rewardOut: rewardsOut.toString(),
      priceImpactBps: 0,
      blockNumber: receipt.blockNumber,
    },
  });

  logger.info(
    {
      launch: launch.address,
      txHash,
      wethIn: amountIn.toString(),
      rewardOut: rewardsOut.toString(),
      fee: pool.fee,
    },
    "buyRewards broadcast",
  );
}

function decodeRewardsOut(logs: readonly Log[], distributor: Address): bigint {
  for (const log of logs) {
    if (log.address.toLowerCase() !== distributor.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: distributorAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "RewardsBought") {
        return (decoded.args as { rewardsOut: bigint }).rewardsOut;
      }
    } catch {
      // Not a RewardsBought log
    }
  }
  return 0n;
}
