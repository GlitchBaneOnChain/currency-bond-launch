import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Landmark, Lock, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { TokenCard } from "@/components/site/token-card";
import { Button } from "@/components/ui/button";
import { CURRENCIES, TOKENS } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bankpad — Launch coins paired with real country currencies" },
      {
        name: "description",
        content:
          "Bankpad is the memecoin launchpad on Robinhood Chain where every token is paired with a real country currency: USD, EUR, GBP, JPY, INR and more.",
      },
      { property: "og:title", content: "Bankpad — Launch coins paired with real country currencies" },
      {
        property: "og:description",
        content: "Bonding curve to locked Uniswap V4 pool. Every coin paired to a national currency.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const trending = TOKENS.slice(0, 6);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Ticker */}
      <div className="overflow-hidden border-b border-border/60 bg-vault py-2">
        <div className="animate-ticker flex w-max gap-8 whitespace-nowrap px-4">
          {[...CURRENCIES, ...CURRENCIES].map((c, i) => (
            <span key={i} className="num text-xs text-muted-foreground">
              {c.flag} {c.code} {c.symbol}
              <span className="ml-2 text-success">open</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="vault-surface relative overflow-hidden">
        <div className="grid-ledger absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="animate-rise mx-auto max-w-3xl text-center">
            <span className="glass-soft inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Landmark className="size-3.5 text-gold" /> Now open on Robinhood Chain
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Launch coins paired with{" "}
              <span className="gold-text">real country currencies</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Bankpad is a launchpad built like a bank. Pick a national currency, mint your coin, and let the
              bonding curve do the rest.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-[image:var(--gradient-gold)] text-base font-semibold text-gold-foreground shadow-[var(--shadow-vault)] transition-transform hover:scale-[1.03] sm:w-auto"
              >
                <Link to="/launch">
                  Launch Token <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-border bg-card/60 text-base sm:w-auto"
              >
                <Link to="/explore">Explore launches</Link>
              </Button>
            </div>
          </div>

          {/* Live stats bar */}
          <div className="glass-panel mx-auto mt-14 grid max-w-4xl grid-cols-2 divide-border rounded-2xl border md:grid-cols-4 md:divide-x">
            <StatCell label="Total launches" value="12,481" />
            <StatCell label="Volume (all pairs)" value="$284.9M" />
            <StatCell label="Fees paid to creators" value="$6.2M" accent />
            <StatCell label="Currencies supported" value="12" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">How Bankpad works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Three steps from an idea to a locked, liquid market denominated in the currency you choose.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Step
            icon={<Coins className="size-5" />}
            step="01"
            title="Pick a currency and mint"
            body="Name your coin, choose its national currency pair, set an optional creator tax, and deploy for a tiny launch fee."
          />
          <Step
            icon={<TrendingUp className="size-5" />}
            step="02"
            title="Trade the bonding curve"
            body="Price rises along a transparent curve as buyers arrive. Every trade routes fees back to you, the creator."
          />
          <Step
            icon={<Lock className="size-5" />}
            step="03"
            title="Graduate to a locked pool"
            body="At full curve, liquidity migrates into a locked Uniswap V4 pool paired with your currency. Nobody can pull it."
          />
        </div>
      </section>

      {/* Currency grid */}
      <section className="border-y border-border/60 bg-vault py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Available currency pairs
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {CURRENCIES.map((c) => (
              <div
                key={c.code}
                className="glass-soft flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-colors hover:border-gold/50"
              >
                <span className="text-lg">{c.flag}</span>
                <span className="num text-sm font-semibold">{c.code}</span>
                <span className="text-sm text-muted-foreground">{c.symbol}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Trending launches</h2>
            <p className="mt-2 text-muted-foreground">Fresh off the curve in the last 24 hours.</p>
          </div>
          <Link to="/explore" className="hidden text-sm font-medium text-primary hover:underline sm:block">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((t) => (
            <TokenCard key={t.address} token={t} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="glass-panel relative overflow-hidden rounded-3xl border p-10 text-center md:p-16">
          <div className="grid-ledger absolute inset-0 opacity-50" />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">Open your branch on Bankpad</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Launch in under a minute. Keep a share of every trade, in the currency your community actually
              uses.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-[image:var(--gradient-gold)] font-semibold text-gold-foreground transition-transform hover:scale-[1.03]"
            >
              <Link to="/launch">
                Launch Token <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-6 py-5 text-center">
      <p className={`num text-2xl font-bold ${accent ? "gold-text" : ""}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function Step({
  icon,
  step,
  title,
  body,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="glass-panel rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </span>
        <span className="num text-xs text-muted-foreground">{step}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
