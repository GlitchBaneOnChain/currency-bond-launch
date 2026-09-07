import { formatUnits, type Address } from "viem";
import { getPublicClient } from "@/lib/chain/clients";
import { DEAD_ADDRESS } from "@/lib/chain/robinhood-chain";
import { launcherTokenAbi } from "./launcher-token";
import { distributorAbi } from "./distributor";

/** Live on-chain snapshot the token page renders alongside the mock
 * off-chain series. Keeps the numbers honest — burned supply is a
 * cheap `balanceOf(dead)`; the rest only show when a distributor is
 * registered for the launch. */
export type ChainStats = {
  totalSupply: bigint;
  burned: bigint;
  burnedPct: number;
  distributor?: {
    totalBurned: bigint;
    totalDistributed: bigint;
    pendingRewards: bigint;
    pendingFees: { memeOwed: bigint; wethOwed: bigint };
    lastDistribution: bigint;
  };
};

export async function readChainStats(
  token: Address,
  distributor?: Address,
): Promise<ChainStats> {
  const client = getPublicClient();

  const [supply, burned] = await Promise.all([
    client.readContract({ address: token, abi: launcherTokenAbi, functionName: "totalSupply" }) as Promise<bigint>,
    client.readContract({
      address: token,
      abi: launcherTokenAbi,
      functionName: "balanceOf",
      args: [DEAD_ADDRESS],
    }) as Promise<bigint>,
  ]);
  const burnedPct = supply === 0n ? 0 : Number((burned * 10_000n) / supply) / 100;

  if (!distributor) return { totalSupply: supply, burned, burnedPct };

  const [totalBurned, totalDistributed, pendingRewards, pending, lastDistribution] = await Promise.all([
    client.readContract({ address: distributor, abi: distributorAbi, functionName: "totalBurned" }) as Promise<bigint>,
    client.readContract({ address: distributor, abi: distributorAbi, functionName: "totalDistributed" }) as Promise<bigint>,
    client.readContract({ address: distributor, abi: distributorAbi, functionName: "pendingRewards" }) as Promise<bigint>,
    client.readContract({ address: distributor, abi: distributorAbi, functionName: "pendingFees" }) as Promise<[bigint, bigint]>,
    client.readContract({ address: distributor, abi: distributorAbi, functionName: "lastDistribution" }) as Promise<bigint>,
  ]);

  return {
    totalSupply: supply,
    burned,
    burnedPct,
    distributor: {
      totalBurned,
      totalDistributed,
      pendingRewards,
      pendingFees: { memeOwed: pending[0], wethOwed: pending[1] },
      lastDistribution,
    },
  };
}

/** Human-friendly formatter that respects the reward-token's decimals. */
export function formatReward(amount: bigint, decimals: number, symbol: string): string {
  const n = Number(formatUnits(amount, decimals));
  return `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
