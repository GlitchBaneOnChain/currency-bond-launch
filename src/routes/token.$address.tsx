import { ClientOnly, createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { OnChainStats } from "@/components/site/on-chain-stats";
import { useMemo, useState } from "react";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Globe, Loader2, Lock, Send, Twitter } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { TokenImage } from "@/components/site/token-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BASE_CREATOR_FEE_BPS,
  PROTOCOL_FEE_BPS,
  compact,
  currency,
  exactMoney,
  timeAgo,
  tokenPrice,
  toTokenView,
} from "@/lib/market";
import { getTokenPage } from "@/lib/market.functions";
import { claimFees, tradeToken } from "@/lib/account.functions";
import { useAccount, useAuth } from "@/hooks/useAuth";

const tokenQuery = (address: string) =>
  queryOptions({
    queryKey: ["token", address],
    queryFn: () => getTokenPage({ data: { address } }),
  });

export const Route = createFileRoute("/token/$address")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(tokenQuery(params.address));
    if (!data.token) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.token) {
      return { meta: [{ title: "Coin unavailable on Bankpad" }, { name: "robots", content: "noindex" }] };
    }
    const t = loaderData.token;
    const title = `${t.name} (${t.ticker}) rewards holders in ${t.pair} on Bankpad`;
    const description = t.description || `${t.name} pays its holders rewards in ${t.pair}. Trade the bonding curve on Bankpad.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: TokenPage,
});

function TokenPage() {
  const { address } = Route.useParams();
  const { data } = useSuspenseQuery(tokenQuery(address));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: account } = useAccount();
  const trade = useServerFn(tradeToken);
  const claimFn = useServerFn(claimFees);

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const token = toTokenView(data.token!);
  const c = currency(token.pair);
  const up = token.change24h >= 0;

  const series = useMemo(() => {
    const points = [...data.trades].reverse().map((t, i) => ({ t: i, p: Number(t.price) }));
    if (points.length === 0) return [{ t: 0, p: token.price }];
    return [...points, { t: points.length, p: token.price }];
  }, [data.trades, token.price]);

  const balance = account?.balances.find((b) => b.currency === token.pair)?.amount ?? 0;
  const holding = account?.holdings.find((h) => h.tokenId === token.id)?.amount ?? 0;
  const isCreator = user?.id === token.creatorId;
  const feePct = (PROTOCOL_FEE_BPS + BASE_CREATOR_FEE_BPS + token.creatorTaxBps) / 100;

  async function submitTrade() {
    if (!user) {
      navigate({ to: "/auth", search: { next: `/token/${token.address}` } });
      return;
    }
    const value = Number(amount);
    if (!(value > 0)) {
      toast.error("Enter an amount greater than zero");
      return;
    }
    setBusy(true);
    try {
      await trade({ data: { tokenId: token.id, side, amount: value } });
      await queryClient.invalidateQueries();
      setAmount("");
      toast.success(side === "buy" ? `Bought ${token.ticker}` : `Sold ${token.ticker}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That trade did not go through");
    } finally {
      setBusy(false);
    }
  }

  async function onClaim() {
    setClaiming(true);
    try {
      const res = await claimFn({ data: { tokenId: token.id } });
      await queryClient.invalidateQueries();
      toast.success(`Claimed ${exactMoney(res.claimed, token.pair)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not claim fees");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="section-glow border-b border-border/60 bg-vault/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-4 py-8 sm:px-6">
          <div className="relative">
            <span className="flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-secondary text-4xl">
              <TokenImage src={token.emoji} alt={token.name} textClassName="size-8" />
            </span>
            <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-background text-sm">
              {c.flag}
            </span>
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{token.name}</h1>
              <span className="num rounded-md bg-secondary px-2 py-0.5 text-xs">
                {token.ticker} · rewards in {c.code}
              </span>
              {token.graduated ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  <Lock className="size-3" /> Graduated
                </span>
              ) : (
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  On curve
                </span>
              )}
            </div>
            <p className="num mt-1 text-xs text-muted-foreground">{token.address}</p>
          </div>
          <div className="text-right">
            <p className="num text-2xl font-bold">
              {c.symbol}
              {tokenPrice(token.price)}
            </p>
            <p className={`num text-sm ${up ? "text-success" : "text-destructive"}`}>
              {up ? "+" : ""}
              {token.change24h.toFixed(1)}% 24h
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Chart */}
          <div className="glass-panel overflow-hidden rounded-2xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Price history</h2>
              <span className="num text-xs text-muted-foreground">
                {data.trades.length} {data.trades.length === 1 ? "trade" : "trades"}
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    labelFormatter={() => ""}
                    formatter={(v: number) => [`${c.symbol}${tokenPrice(v)}`, "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="p"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#fill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {data.trades.length === 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                No trades yet. The first buy sets the opening move.
              </p>
            )}
          </div>

          {/* Graduation */}
          <div className="glass-panel rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{token.graduated ? "Locked pool" : "Graduation progress"}</h2>
              <span className="num text-sm text-primary">{token.progress.toFixed(1)}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-700"
                style={{ width: `${token.progress}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {token.graduated
                ? `Liquidity is locked in the ${token.ticker} / ${c.code} pool.`
                : `When the curve fills, liquidity locks into the ${token.ticker} / ${c.code} pool.`}
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Market cap" value={`${c.symbol}${compact(token.marketCap)}`} />
            <Stat label="Volume 24h" value={`${c.symbol}${compact(token.volume24h)}`} />
            <Stat label="Reserve" value={`${c.symbol}${compact(token.reserve)}`} />
            <Stat label="Holders" value={compact(token.holders)} />
          </div>

          {/* Live on-chain snapshot. Client-only because viem's public client
              runs in the browser; the panel handles its own loading state. */}
          <ClientOnly>
            <OnChainStats
              tokenAddress={token.address}
              rewardCode={token.pair}
            />
          </ClientOnly>

          {/* About */}
          <div className="glass-panel rounded-2xl border p-5">
            <h2 className="font-semibold">About {token.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {token.description || "The creator has not added a description yet."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Social icon={<Globe className="size-3.5" />} label="Website" href={token.website} />
              <Social icon={<Twitter className="size-3.5" />} label="Twitter" href={token.twitter} />
              <Social icon={<Send className="size-3.5" />} label="Telegram" href={token.telegram} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Created by {token.creatorName} · {timeAgo(token.createdAt)}
            </p>
          </div>

          {/* Recent trades */}
          <div className="glass-panel rounded-2xl border p-5">
            <h2 className="font-semibold">Recent trades</h2>
            {data.trades.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nothing has traded yet.</p>
            ) : (
              <div className="mt-3 divide-y divide-border/60">
                {data.trades.slice(0, 15).map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 text-sm">
                    <span
                      className={`font-semibold capitalize ${t.side === "buy" ? "text-success" : "text-destructive"}`}
                    >
                      {t.side}
                    </span>
                    <span className="num text-muted-foreground">
                      {compact(Number(t.token_amount))} {token.ticker}
                    </span>
                    <span className="num">
                      {c.symbol}
                      {Number(t.currency_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="num text-xs text-muted-foreground">{timeAgo(t.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trade panel */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="glass-panel rounded-2xl border p-5">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/60 p-1">
              {(["buy", "sell"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
                    side === s
                      ? s === "buy"
                        ? "bg-success/20 text-success"
                        : "bg-destructive/20 text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Amount</span>
                <span className="num">
                  {side === "buy"
                    ? `Balance ${exactMoney(balance, token.pair)}`
                    : `Holding ${compact(holding)} ${token.ticker}`}
                </span>
              </div>
              <div className="glass-control flex items-center gap-2 rounded-xl border border-border px-3">
                <span className="flex size-5 items-center justify-center overflow-hidden text-lg">
                  {side === "buy" ? c.flag : <TokenImage src={token.emoji} alt="" textClassName="text-lg" />}
                </span>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  className="num border-0 bg-transparent px-0 text-lg shadow-none focus-visible:ring-0"
                />
                <span className="num text-sm text-muted-foreground">
                  {side === "buy" ? c.code : token.ticker}
                </span>
              </div>
              <div className="mt-2 flex gap-2">
                {(side === "buy" ? ["25", "100", "500", "Max"] : ["25%", "50%", "100%"]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      if (side === "buy") {
                        setAmount(p === "Max" ? String(balance) : p);
                      } else {
                        const pct = Number(p.replace("%", "")) / 100;
                        setAmount(String(holding * pct));
                      }
                    }}
                    className="glass-control num flex-1 rounded-lg border border-border py-1.5 text-xs text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <Row
                label="Estimated"
                value={
                  side === "buy"
                    ? `~${compact(token.price > 0 ? (Number(amount) || 0) / token.price : 0)} ${token.ticker}`
                    : `~${c.symbol}${tokenPrice((Number(amount) || 0) * token.price)}`
                }
              />
              <Row label="Trading fee" value={`${feePct.toFixed(1)}%`} />
              <Row label="Creator tax" value={`${(token.creatorTaxBps / 100).toFixed(1)}%`} />
            </div>

            <Button
              size="lg"
              disabled={busy}
              onClick={submitTrade}
              className={`mt-4 w-full font-semibold ${
                side === "buy"
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Confirming
                </>
              ) : !user ? (
                "Connect wallet to trade"
              ) : (
                `${side === "buy" ? "Buy" : "Sell"} ${token.ticker}`
              )}
            </Button>
            {!user && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                New accounts start with a test balance of 10,000 in each currency they trade.
              </p>
            )}
          </div>

          {/* Creator fees */}
          {isCreator && (
            <div className="glass-panel rounded-2xl border border-primary/30 p-5">
              <h2 className="font-semibold">Your creator fees</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Paid in {c.flag} {c.code} as people trade.
              </p>
              <p className="num mt-4 text-2xl font-bold brand-text">
                {exactMoney(token.feesAccrued, token.pair)}
              </p>
              <Button
                disabled={claiming || token.feesAccrued <= 0}
                onClick={onClaim}
                variant="outline"
                className="mt-4 w-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
              >
                {claiming ? <Loader2 className="size-4 animate-spin" /> : "Claim fees"}
              </Button>
              <p className="num mt-2 text-center text-[11px] text-muted-foreground">
                {exactMoney(token.feesClaimed, token.pair)} claimed so far
              </p>
            </div>
          )}

          <Link to="/explore" className="block text-center text-sm text-primary hover:underline">
            Back to all launches
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel glass-interactive rounded-2xl border p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="num mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="num text-foreground">{value}</span>
    </div>
  );
}

function Social({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      {icon} {label}
    </a>
  );
}
