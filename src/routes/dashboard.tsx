import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAccount as useWagmiAccount } from "wagmi";
import { ArrowUpRight, Loader2, Plus, Wallet } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { compact, currency, exactMoney, tokenPrice, toTokenView, type TokenView } from "@/lib/market";
import { listTokens } from "@/lib/market.functions";
import { claimFees } from "@/lib/account.functions";
import { useAccount, useAuth } from "@/hooks/useAuth";
import { TokenImage } from "@/components/site/token-image";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Bankpad dashboard" },
      {
        name: "description",
        content:
          "Track the coins you launched on Bankpad, claim creator fees in the country currency your holders earn, and follow your positions.",
      },
      { property: "og:title", content: "Your Bankpad dashboard" },
      { property: "og:description", content: "Your launches, balances, positions and claimable fees." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading, signingIn, signInError, retrySignIn } = useAuth();
  const { data: account, isLoading } = useAccount();
  const { data: market } = useQuery({ queryKey: ["tokens"], queryFn: () => listTokens() });
  const wagmi = useWagmiAccount();

  const myTokens = (account?.myTokens ?? []).map(toTokenView);
  const allTokens = (market?.tokens ?? []).map(toTokenView);
  const positions = (account?.holdings ?? [])
    .map((h) => ({ holding: h, token: allTokens.find((t) => t.id === h.tokenId) }))
    .filter((p): p is { holding: { tokenId: string; amount: number }; token: TokenView } => Boolean(p.token));

  const totalVolume = myTokens.reduce((s, t) => s + t.volume24h, 0);
  const totalHolders = myTokens.reduce((s, t) => s + t.holders, 0);
  const totalFees = myTokens.reduce((s, t) => s + t.feesAccrued + t.feesClaimed, 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="section-glow border-b border-border/60 bg-vault/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-12 sm:px-6">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Your dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {user ? account?.displayName ?? "Signed in" : "Connect your wallet to see your launches and positions"}
            </p>
          </div>
          <Button asChild className="bg-primary font-semibold text-primary-foreground">
            <Link to="/launch">
              <Plus className="mr-2 size-4" /> New launch
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {!user && !loading && !wagmi.isConnected ? (
          <div className="glass-soft rounded-2xl border border-dashed p-12 text-center">
            <p className="text-lg font-semibold">Connect your wallet to open your dashboard</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Your launches, balances, positions and creator fees all live here.
            </p>
            <Button
              asChild
              className="mt-6 bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground"
            >
              <Link to="/auth" search={{ next: "/dashboard" }}>
                Connect wallet
              </Link>
            </Button>
          </div>
        ) : !user && !loading && wagmi.isConnected ? (
          <div className="glass-soft rounded-2xl border border-dashed p-12 text-center">
            <p className="text-lg font-semibold">
              {signingIn ? "Sign the message in your wallet" : "One quick signature to open your dashboard"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {signingIn
                ? "Approve the sign-in request from your wallet. Nothing moves, this is just proof it's you."
                : "Bankpad asks your wallet to sign a free message so nobody else can open your dashboard. Click below if you missed the prompt."}
            </p>
            {signInError && (
              <p className="mx-auto mt-3 max-w-md text-xs text-destructive">{signInError}</p>
            )}
            <Button
              onClick={retrySignIn}
              disabled={signingIn}
              className="mt-6 bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground"
            >
              {signingIn ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Waiting for signature
                </>
              ) : (
                <>
                  <Wallet className="mr-2 size-4" />
                  Sign in with wallet
                </>
              )}
            </Button>
          </div>
        ) : isLoading || loading ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi label="Coins launched" value={String(myTokens.length)} />
              <Kpi label="Volume 24h" value={compact(totalVolume)} />
              <Kpi label="Holders reached" value={compact(totalHolders)} />
              <Kpi label="Creator fees earned" value={compact(totalFees)} accent />
            </div>

            <h2 className="mt-12 text-xl font-semibold">Your balances</h2>
            {(account?.balances ?? []).length === 0 ? (
              <div className="glass-soft mt-4 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No balance yet. Your first trade opens a test balance of 10,000 in that currency.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {(account?.balances ?? []).map((b) => (
                  <div key={b.currency} className="glass-panel rounded-xl border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {currency(b.currency).flag} {b.currency}
                    </p>
                    <p className="num mt-1 text-lg font-semibold">{exactMoney(b.amount, b.currency)}</p>
                  </div>
                ))}
              </div>
            )}

            <h2 className="mt-12 text-xl font-semibold">Your positions</h2>
            {positions.length === 0 ? (
              <div className="glass-soft mt-4 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                You do not hold any coins yet.{" "}
                <Link to="/explore" className="text-primary hover:underline">
                  Explore launches
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {positions.map(({ holding, token }) => {
                  const c = currency(token.pair);
                  return (
                    <Link
                      key={holding.tokenId}
                      to="/token/$address"
                      params={{ address: token.address }}
                      className="glass-panel flex items-center gap-4 rounded-2xl border p-4 transition-all hover:border-primary/35"
                    >
                      <span className="flex size-11 items-center justify-center overflow-hidden rounded-lg bg-secondary text-xl">
                        <TokenImage src={token.emoji} alt={token.name} textClassName="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{token.name}</p>
                        <p className="num text-xs text-muted-foreground">
                          {compact(holding.amount)} {token.ticker}
                        </p>
                      </div>
                      <p className="num text-sm font-semibold">
                        {c.symbol}
                        {tokenPrice(holding.amount * token.price)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}

            <h2 className="mt-12 text-xl font-semibold">Your launches</h2>
            {myTokens.length === 0 ? (
              <div className="glass-soft mt-4 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                You have not launched a coin yet.{" "}
                <Link to="/launch" className="text-primary hover:underline">
                  Launch your first one
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {myTokens.map((t) => (
                  <LaunchRow key={t.address} token={t} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass-panel glass-interactive rounded-2xl border p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`num mt-2 text-2xl font-bold ${accent ? "brand-text" : ""}`}>{value}</p>
    </div>
  );
}

function LaunchRow({ token }: { token: TokenView }) {
  const c = currency(token.pair);
  const [busy, setBusy] = useState(false);
  const claim = useServerFn(claimFees);
  const queryClient = useQueryClient();

  async function onClaim(e: React.MouseEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await claim({ data: { tokenId: token.id } });
      await queryClient.invalidateQueries();
      toast.success(`Claimed ${exactMoney(res.claimed, token.pair)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not claim fees");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-panel flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition-all hover:border-primary/35 hover:shadow-[var(--shadow-glow)] sm:p-5">
      <div className="relative">
        <span className="flex size-12 items-center justify-center overflow-hidden rounded-lg bg-secondary text-2xl">
          <TokenImage src={token.emoji} alt={token.name} textClassName="size-6" />
        </span>
        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-xs">
          {c.flag}
        </span>
      </div>
      <div className="min-w-[140px] flex-1">
        <p className="font-semibold">{token.name}</p>
        <p className="num text-xs text-muted-foreground">
          {token.ticker} · rewards in {c.code} ·{" "}
          {token.graduated ? "Graduated" : `${token.progress.toFixed(1)}% on curve`}
        </p>
      </div>
      <div className="hidden gap-6 sm:flex">
        <Mini label="Volume 24h" value={`${c.symbol}${compact(token.volume24h)}`} />
        <Mini label="Holders" value={compact(token.holders)} />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Claimable</p>
          <p className="num text-sm font-semibold text-primary">{exactMoney(token.feesAccrued, token.pair)}</p>
        </div>
        <Button
          size="sm"
          disabled={busy || token.feesAccrued <= 0}
          onClick={onClaim}
          className="bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Claim"}
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
