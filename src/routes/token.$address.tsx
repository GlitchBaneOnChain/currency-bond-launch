import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, Globe, Loader2, Lock, Send, Twitter } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compact, currency, priceSeries, tokenByAddress } from "@/lib/mock-data";

export const Route = createFileRoute("/token/$address")({
  loader: ({ params }) => {
    const token = tokenByAddress(params.address);
    if (!token) throw notFound();
    return { token };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Token unavailable — Bankpad" }, { name: "robots", content: "noindex" }] };
    }
    const t = loaderData.token;
    const title = `${t.name} (${t.ticker} / ${t.pair}) — Bankpad`;
    return {
      meta: [
        { title },
        { name: "description", content: t.description },
        { property: "og:title", content: title },
        { property: "og:description", content: t.description },
      ],
    };
  },
  component: TokenPage,
});

function TokenPage() {
  const { token } = Route.useLoaderData();
  const c = currency(token.pair);
  const data = useMemo(() => priceSeries(token.holders), [token.holders]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");
  const [claim, setClaim] = useState<"idle" | "claiming" | "claimed">("idle");
  const up = token.change24h >= 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="border-b border-border/60 bg-vault">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-4 py-8 sm:px-6">
          <div className="relative">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-4xl">
              {token.emoji}
            </span>
            <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-background text-sm">
              {c.flag}
            </span>
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{token.name}</h1>
              <span className="num rounded-md bg-secondary px-2 py-0.5 text-xs">
                {token.ticker} / {c.code}
              </span>
              {token.graduated ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
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
              {token.price.toLocaleString(undefined, { maximumSignificantDigits: 4 })}
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
          <div className="glass-panel rounded-2xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Price</h2>
              <div className="flex gap-1">
                {["1H", "24H", "7D", "ALL"].map((r, i) => (
                  <span
                    key={r}
                    className={`num rounded-md px-2 py-1 text-xs ${i === 1 ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
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
                    formatter={(v: number) => [`${c.symbol}${v}`, "Price"]}
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
          </div>

          {/* Graduation */}
          <div className="glass-panel rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                {token.graduated ? "Locked Uniswap V4 pool" : "Graduation progress"}
              </h2>
              <span className="num text-sm text-gold">{token.progress}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-700 ${token.graduated ? "bg-[image:var(--gradient-gold)]" : "bg-[image:var(--gradient-blue)]"}`}
                style={{ width: `${token.progress}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {token.graduated
                ? `Liquidity migrated and locked forever in the ${token.ticker} / ${c.code} pool.`
                : `When the curve fills, liquidity moves into a locked ${token.ticker} / ${c.code} Uniswap V4 pool.`}
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Market cap" value={`${c.symbol}${compact(token.marketCap)}`} />
            <Stat label="Volume 24h" value={`${c.symbol}${compact(token.volume24h)}`} />
            <Stat label="Liquidity" value={`${c.symbol}${compact(token.liquidity)}`} />
            <Stat label="Holders" value={compact(token.holders)} />
          </div>

          {/* About */}
          <div className="glass-panel rounded-2xl border p-5">
            <h2 className="font-semibold">About {token.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{token.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Social icon={<Globe className="size-3.5" />} label="Website" href={token.website} />
              <Social icon={<Twitter className="size-3.5" />} label="Twitter" href={token.twitter} />
              <Social icon={<Send className="size-3.5" />} label="Telegram" href={token.telegram} />
            </div>
            <p className="num mt-4 text-xs text-muted-foreground">
              Created by {token.creator} · {token.createdAgo}
            </p>
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
                  Balance {c.symbol}
                  1,204.00
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                <span className="text-lg">{side === "buy" ? c.flag : token.emoji}</span>
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
                {["25", "100", "500", "Max"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(p === "Max" ? "1204" : p)}
                    className="num flex-1 rounded-lg border border-border bg-secondary/50 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <Row label="You receive" value={`~${compact((Number(amount) || 0) / token.price)} ${token.ticker}`} />
              <Row label="Trading fee" value="1.0%" />
              <Row label="Price impact" value="0.42%" />
            </div>

            <Button
              size="lg"
              disabled={state !== "idle"}
              onClick={() => {
                setState("pending");
                setTimeout(() => setState("done"), 1600);
              }}
              className={`mt-4 w-full font-semibold ${
                side === "buy"
                  ? "bg-[image:var(--gradient-gold)] text-gold-foreground"
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              {state === "pending" && (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Confirming...
                </>
              )}
              {state === "done" && (
                <>
                  <Check className="mr-2 size-4" /> Order filled
                </>
              )}
              {state === "idle" && `${side === "buy" ? "Buy" : "Sell"} ${token.ticker}`}
            </Button>
          </div>

          {/* Creator fees */}
          <div className="glass-panel rounded-2xl border border-gold/30 p-5">
            <h2 className="font-semibold">Creator fees</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Paid in {c.flag} {c.code} to the launch wallet.
            </p>
            <p className="num mt-4 text-2xl font-bold gold-text">
              {c.symbol}
              {token.creatorFees.toLocaleString()}
            </p>
            <Button
              disabled={claim !== "idle"}
              onClick={() => {
                setClaim("claiming");
                setTimeout(() => setClaim("claimed"), 1400);
              }}
              variant="outline"
              className="mt-4 w-full border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
            >
              {claim === "idle" && "Claim fees"}
              {claim === "claiming" && <Loader2 className="size-4 animate-spin" />}
              {claim === "claimed" && "Claimed"}
            </Button>
          </div>

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
    <div className="glass-panel rounded-2xl border p-4">
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

function Social({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string | undefined }) {
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
