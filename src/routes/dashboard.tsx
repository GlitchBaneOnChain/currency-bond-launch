import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Check, Loader2, Plus } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { MY_TOKENS, compact, currency } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Creator dashboard — Bankpad" },
      {
        name: "description",
        content:
          "Track the coins you launched on Bankpad, claim creator fees in their paired country currency, and watch holder growth.",
      },
      { property: "og:title", content: "Creator dashboard — Bankpad" },
      { property: "og:description", content: "Your launches, claimable fees and analytics in one vault." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="border-b border-border/60 bg-vault">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-12 sm:px-6">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Creator dashboard</h1>
            <p className="num mt-2 text-sm text-muted-foreground">0x91ab...42fe</p>
          </div>
          <Button asChild className="bg-primary font-semibold text-primary-foreground">
            <Link to="/launch">
              <Plus className="mr-2 size-4" /> New launch
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Tokens launched" value={String(MY_TOKENS.length)} />
          <Kpi label="Total volume" value="$1.42M" />
          <Kpi label="Holders reached" value="3,120" />
          <Kpi label="Fees earned" value="$18,204" accent />
        </div>

        <h2 className="mt-12 text-xl font-semibold">Your launches</h2>
        <div className="mt-4 space-y-4">
          {MY_TOKENS.map((t) => (
            <LaunchRow key={t.address} token={t} />
          ))}
        </div>

        <h2 className="mt-12 text-xl font-semibold">Volume by currency</h2>
        <div className="glass-panel mt-4 rounded-2xl border p-6">
          {[
            { code: "USD", pct: 62 },
            { code: "CAD", pct: 23 },
            { code: "BRL", pct: 15 },
          ].map((r) => {
            const c = currency(r.code);
            return (
              <div key={r.code} className="mb-4 last:mb-0">
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>
                    {c.flag} <span className="num">{c.code}</span>
                  </span>
                  <span className="num text-muted-foreground">{r.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-[image:var(--gradient-blue)]"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass-panel rounded-2xl border p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`num mt-2 text-2xl font-bold ${accent ? "gold-text" : ""}`}>{value}</p>
    </div>
  );
}

function LaunchRow({ token }: { token: (typeof MY_TOKENS)[number] }) {
  const c = currency(token.pair);
  const [state, setState] = useState<"idle" | "claiming" | "claimed">("idle");

  return (
    <div className="glass-panel flex flex-wrap items-center gap-4 rounded-2xl border p-4 sm:p-5">
      <div className="relative">
        <span className="flex size-12 items-center justify-center rounded-lg bg-secondary text-2xl">
          {token.emoji}
        </span>
        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-xs">
          {c.flag}
        </span>
      </div>
      <div className="min-w-[140px] flex-1">
        <p className="font-semibold">{token.name}</p>
        <p className="num text-xs text-muted-foreground">
          {token.ticker} / {c.code} · {token.graduated ? "Graduated" : `${token.progress}% on curve`}
        </p>
      </div>
      <div className="hidden gap-6 sm:flex">
        <Mini label="Volume" value={`${c.symbol}${compact(token.volume24h)}`} />
        <Mini label="Holders" value={compact(token.holders)} />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Claimable</p>
          <p className="num text-sm font-semibold text-gold">
            {c.symbol}
            {token.creatorFees.toLocaleString()}
          </p>
        </div>
        <Button
          size="sm"
          disabled={state !== "idle"}
          onClick={() => {
            setState("claiming");
            setTimeout(() => setState("claimed"), 1400);
          }}
          className="bg-[image:var(--gradient-gold)] font-semibold text-gold-foreground"
        >
          {state === "idle" && "Claim"}
          {state === "claiming" && <Loader2 className="size-4 animate-spin" />}
          {state === "claimed" && <Check className="size-4" />}
        </Button>
        <Link
          to="/token/$address"
          params={{ address: token.address }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="num text-sm font-semibold">{value}</p>
    </div>
  );
}
