import { useEffect, useState } from "react";
import { formatUnits, type Address } from "viem";
import { Flame, Coins, Gift, Clock, ExternalLink } from "lucide-react";
import { readChainStats, formatReward, type ChainStats } from "@/lib/pons/reads";
import { rewardCurrency } from "@/lib/registry/reward-currencies";
import { compact } from "@/lib/market";

const EXPLORER = "https://robinhoodchain.blockscout.com";

type Props = {
  tokenAddress: string;
  distributorAddress?: string;
  rewardCode: string;
};

/** Live on-chain snapshot for a Bankpad launch: burned supply, and — if a
 * BankpadDistributor is registered — total rewards distributed, pending
 * rewards waiting to be paid, and pending V3 position fees waiting to be
 * claimed. Keeps the token page honest about what's really on chain. */
export function OnChainStats({ tokenAddress, distributorAddress, rewardCode }: Props) {
  const [state, setState] = useState<{ loading: boolean; stats?: ChainStats; error?: string }>({
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    readChainStats(tokenAddress as Address, distributorAddress as Address | undefined)
      .then((stats) => {
        if (alive) setState({ loading: false, stats });
      })
      .catch((err) => {
        if (alive) {
          setState({
            loading: false,
            error: err instanceof Error ? err.message : "Could not read on-chain state",
          });
        }
      });
    return () => {
      alive = false;
    };
  }, [tokenAddress, distributorAddress]);

  const reward = rewardCurrency(rewardCode);
  const rewardSymbol = reward?.symbol ?? "";
  const rewardDecimals = reward?.decimals ?? 18;

  return (
    <div className="glass-panel rounded-2xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">On-chain state</h2>
        <a
          href={`${EXPLORER}/address/${tokenAddress}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          Blockscout <ExternalLink className="size-3" />
        </a>
      </div>

      {state.loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary/40" />
          ))}
        </div>
      )}

      {state.error && (
        <p className="text-sm text-destructive">Chain read failed: {state.error}</p>
      )}

      {state.stats && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile
              icon={<Flame className="size-4 text-primary" />}
              label="Supply burned"
              value={`${compact(Number(formatUnits(state.stats.burned, 18)))} · ${state.stats.burnedPct.toFixed(2)}%`}
            />
            {state.stats.distributor ? (
              <>
                <StatTile
                  icon={<Gift className="size-4 text-primary" />}
                  label={`Rewards paid in ${rewardCode}`}
                  value={formatReward(state.stats.distributor.totalDistributed, rewardDecimals, rewardSymbol)}
                />
                <StatTile
                  icon={<Coins className="size-4 text-primary" />}
                  label={`Pending ${rewardCode} rewards`}
                  value={formatReward(state.stats.distributor.pendingRewards, rewardDecimals, rewardSymbol)}
                />
                <StatTile
                  icon={<Clock className="size-4 text-primary" />}
                  label="Last distribution"
                  value={formatLastDistribution(state.stats.distributor.lastDistribution)}
                />
              </>
            ) : (
              <div className="glass-soft rounded-lg border border-dashed p-3 text-xs text-muted-foreground sm:col-span-2">
                No distributor registered for this launch yet. Once the creator
                turns on automated rewards, this panel will show pending V3
                fees, total rewards paid to holders, and the next scheduled
                distribution.
              </div>
            )}
          </div>

          {distributorAddress && (
            <p className="num text-[11px] text-muted-foreground">
              Distributor:{" "}
              <a
                href={`${EXPLORER}/address/${distributorAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {short(distributorAddress)}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-soft rounded-lg border p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="num mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function short(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function formatLastDistribution(ts: bigint): string {
  if (ts === 0n) return "Never";
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - Number(ts));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}
