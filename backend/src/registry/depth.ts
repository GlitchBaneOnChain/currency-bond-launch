import type { Address } from "viem";
import { getPublicClient } from "../chain/clients.js";
import { config } from "../config.js";
import { v3FactoryAbi, v3PoolAbi } from "../pons/uniswap.js";
import type { RewardCurrencyDefinition } from "./currencies.js";

/** Find the deepest WETH ↔ reward Uniswap V3 pool and return the address
 * plus its fee tier. We probe the three canonical fee tiers (0.05%, 0.3%,
 * 1%) and pick the one with the largest active liquidity — the pool the
 * automation engine should route through.
 *
 * Returns undefined when no pool exists at any tier. Callers should treat
 * that as "reward currency has no live venue on this chain yet" and skip. */
export type PoolChoice = {
  address: Address;
  fee: number;
  liquidity: bigint;
};

const FEE_TIERS: readonly number[] = [500, 3_000, 10_000];

export async function findBestRewardPool(
  currency: RewardCurrencyDefinition,
): Promise<PoolChoice | undefined> {
  const client = getPublicClient();
  const factory = config.UNISWAP_V3_FACTORY as Address;
  const weth = config.BANKPAD_WETH as Address;

  const candidates: (PoolChoice | null)[] = await Promise.all(
    FEE_TIERS.map(async (fee): Promise<PoolChoice | null> => {
      const pool = (await client.readContract({
        address: factory,
        abi: v3FactoryAbi,
        functionName: "getPool",
        args: [weth, currency.address, fee],
      })) as Address;
      if (pool === "0x0000000000000000000000000000000000000000") return null;
      const liquidity = (await client.readContract({
        address: pool,
        abi: v3PoolAbi,
        functionName: "liquidity",
      })) as bigint;
      return { address: pool, fee, liquidity };
    }),
  );

  const live: PoolChoice[] = candidates.filter(
    (c): c is PoolChoice => c !== null && c.liquidity > 0n,
  );
  if (live.length === 0) return undefined;
  live.sort((a, b) => (a.liquidity < b.liquidity ? 1 : -1));
  return live[0];
}

/** Compute the minimum-out slippage floor for a WETH → reward swap.
 *
 * Uses the pool's sqrtPriceX96 to derive a spot quote, applies the
 * caller's slippage bps, and returns the raw uint the SwapRouter expects.
 *
 * Slippage math is intentionally simple — the pool-depth floor
 * (enforced separately in the depth registry) is what actually bounds
 * cost impact; slippage here is a MEV cap, not a liquidity check. */
export function minOutFromSpot(
  amountIn: bigint,
  sqrtPriceX96: bigint,
  wethIsToken0: boolean,
  slippageBps: number,
): bigint {
  const Q96 = 2n ** 96n;
  const numerator = sqrtPriceX96 * sqrtPriceX96;
  const spot = numerator / ((Q96 * Q96) / (10n ** 18n));

  const rawOut = wethIsToken0
    ? (amountIn * spot) / 10n ** 18n
    : (amountIn * 10n ** 18n) / spot;

  const bps = BigInt(10_000 - slippageBps);
  return (rawOut * bps) / 10_000n;
}
