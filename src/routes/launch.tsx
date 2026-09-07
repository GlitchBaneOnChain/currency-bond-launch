import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { formatEther } from "viem";
import { useAccount, useWalletClient, useSwitchChain } from "wagmi";
import { Globe, Info, Loader2, Send, Twitter, Wallet, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { CURRENCIES, currency, PROTOCOL_FEE_BPS, BASE_CREATOR_FEE_BPS } from "@/lib/market";
import { launchToken } from "@/lib/account.functions";
import { launchTokenTx, readLaunchFee } from "@/lib/pons/launch";
import { isLaunchable } from "@/lib/registry/reward-currencies";
import { robinhoodChain } from "@/lib/chain/robinhood-chain";

export const Route = createFileRoute("/launch")({
  validateSearch: (search: Record<string, unknown>): { pair?: string } =>
    typeof search["pair"] === "string" ? { pair: search["pair"] } : {},
  head: () => ({
    meta: [
      { title: "Launch a token on Bankpad" },
      {
        name: "description",
        content:
          "Mint your coin on Bankpad in under a minute: pick a national reward currency, set a creator tax, and let holders earn.",
      },
      { property: "og:title", content: "Launch a token on Bankpad" },
      {
        property: "og:description",
        content: "Pick a country currency, set your creator tax, and pay holders rewards in real money.",
      },
    ],
  }),
  component: LaunchPage,
});

function LaunchPage() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [desc, setDesc] = useState("");
  const search = Route.useSearch();
  const initialPair = search.pair && isLaunchable(search.pair) ? search.pair : "USD";
  const [pair, setPair] = useState(initialPair);
  const [tax, setTax] = useState(1);
  const [logo, setLogo] = useState("🏦");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [busy, setBusy] = useState(false);
  const [launchFeeEth, setLaunchFeeEth] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId: robinhoodChain.id });
  const { switchChainAsync } = useSwitchChain();
  const onRightChain = chainId === robinhoodChain.id;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submit = useServerFn(launchToken);

  const c = currency(pair);
  const currencyLaunchable = isLaunchable(pair);

  // Load the current on-chain launch fee once the wallet is on the right chain.
  useEffect(() => {
    if (!onRightChain) return;
    let alive = true;
    readLaunchFee()
      .then((wei) => {
        if (alive) setLaunchFeeEth(formatEther(wei));
      })
      .catch(() => {
        if (alive) setLaunchFeeEth(null);
      });
    return () => {
      alive = false;
    };
  }, [onRightChain]);

  const formValid = useMemo(() => {
    if (name.trim().length < 2 || name.trim().length > 40) return false;
    if (!/^[A-Z0-9]{2,8}$/.test(ticker)) return false;
    if (!currencyLaunchable) return false;
    return true;
  }, [name, ticker, currencyLaunchable]);

  async function handleLaunch() {
    if (!isConnected || !address) {
      toast.error("Connect your wallet to launch a coin");
      return;
    }
    if (!currencyLaunchable) {
      toast.error(`${pair} is not launchable yet. Pick a listed currency.`);
      return;
    }
    if (!walletClient) {
      toast.error("Wallet is not ready yet. Try again in a moment.");
      return;
    }
    if (!onRightChain) {
      try {
        await switchChainAsync({ chainId: robinhoodChain.id });
      } catch {
        toast.error("Switch to Robinhood Chain to launch");
        return;
      }
    }

    setBusy(true);
    try {
      // 1. Ship the token through the Pons V1 factory. In self-custody mode
      //    the creator's own wallet becomes the fee wallet; the automation
      //    engine (Slice 5) will offer to accept the fee-wallet role later.
      const onChain = await launchTokenTx(walletClient, {
        name: name.trim(),
        symbol: ticker.trim().toUpperCase(),
        logo,
        description: desc.trim().slice(0, 280),
        socials: {
          twitter: twitter.trim(),
          telegram: telegram.trim(),
          website: website.trim(),
        },
        feeWallet: address,
        rewardCurrencyCode: pair,
      });

      // 2. Persist the off-chain metadata (creator tax, socials, emoji) so
      //    Explore and Dashboard can render the launch. The address is the
      //    real one the factory returned; no more mock.
      await submit({
        data: {
          name: name.trim(),
          ticker: ticker.trim().toUpperCase(),
          emoji: logo,
          pair,
          description: desc.trim().slice(0, 280),
          website: website.trim(),
          twitter: twitter.trim(),
          telegram: telegram.trim(),
          creatorTaxBps: Math.round(tax * 100),
          onChainAddress: onChain.token,
          launchTxHash: onChain.txHash,
        },
      });

      await queryClient.invalidateQueries();
      toast.success(`${ticker} is live on Robinhood Chain`);
      navigate({ to: "/token/$address", params: { address: onChain.token } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not launch that coin";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="section-glow border-b border-border/60 bg-vault/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Open a new coin</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every Bankpad coin pays its holders in a real national currency. Fill in the paperwork, and the
            vault handles the rest.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Form */}
        <div className="space-y-6">
          <Panel title="Token details" step="01">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Token name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pepe Reserve"
                  className="glass-control"
                />
              </Field>
              <Field label="Ticker">
                <Input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 8))}
                  placeholder="PEPE"
                  className="glass-control num uppercase"
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 280))}
                placeholder="Tell holders what this coin stands for."
                rows={4}
                className="glass-control resize-none"
              />
              <p className="num mt-1 text-right text-[11px] text-muted-foreground">{desc.length}/280</p>
            </Field>
            <Field label="Logo">
              <div className="flex items-center gap-4">
                <div className="glass-control flex size-16 items-center justify-center rounded-xl border border-dashed text-3xl">
                  {logo}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {["🏦", "🐸", "🐕", "🚀", "💷", "🦁", "🍣", "🥖"].map((e) => (
                      <button
                        key={e}
                        onClick={() => setLogo(e)}
                        className={`size-9 rounded-lg border text-lg transition-colors ${
                          logo === e ? "border-primary bg-primary/15" : "border-border bg-secondary/50"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Field>
          </Panel>

          <Panel title="Reward currency" step="02">
            <p className="-mt-2 mb-4 text-sm text-muted-foreground">
              Pick the national currency your holders earn as rewards. Every trade routes a share of the fees
              back to holders, paid in this currency. Only launchable currencies have a live reward-token
              contract behind them.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CURRENCIES.map((cur) => {
                const live = isLaunchable(cur.code);
                const selected = pair === cur.code;
                return (
                  <button
                    key={cur.code}
                    onClick={() => live && setPair(cur.code)}
                    disabled={!live}
                    className={`relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                      selected
                        ? "border-primary/60 bg-primary/10 shadow-[var(--shadow-vault)]"
                        : live
                          ? "glass-control border-border hover:-translate-y-0.5 hover:border-primary/40"
                          : "glass-control border-border opacity-45"
                    }`}
                  >
                    <span className="text-xl">{cur.flag}</span>
                    <span className="min-w-0">
                      <span className="num block text-sm font-semibold">{cur.code}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{cur.name}</span>
                    </span>
                    {!live && (
                      <span className="absolute right-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Links and creator tax" step="03">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Website">
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  className="glass-control"
                />
              </Field>
              <Field label="Twitter">
                <Input
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/"
                  className="glass-control"
                />
              </Field>
              <Field label="Telegram">
                <Input
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="https://t.me/"
                  className="glass-control"
                />
              </Field>
            </div>
            <Field label={`Creator tax: ${tax.toFixed(1)}%`}>
              <Slider
                value={[tax]}
                onValueChange={(v) => setTax(v[0] ?? 0)}
                min={0}
                max={5}
                step={0.5}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Optional. Taken on each trade and paid to you in {c.flag} {c.code}.
              </p>
            </Field>
          </Panel>

          <div className="glass-soft rounded-2xl border p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
               <Info className="size-4 text-primary" /> Fees
            </p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <FeeRow
                label="Launch fee"
                value={launchFeeEth ? `${launchFeeEth} ETH` : "0.0005 ETH"}
              />
              <FeeRow
                label="Trading fee"
                value={`${((PROTOCOL_FEE_BPS + BASE_CREATOR_FEE_BPS) / 100).toFixed(1)}%`}
              />
              <FeeRow
                label="Split"
                value={`${BASE_CREATOR_FEE_BPS / 10}0% creator / ${PROTOCOL_FEE_BPS / 10}0% protocol`}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Live preview
          </p>
          <div className="glass-panel overflow-hidden rounded-2xl border p-5">
            <div className="flex items-start gap-3">
              <div className="relative">
                <span className="flex size-14 items-center justify-center rounded-xl bg-secondary text-3xl">
                  {logo}
                </span>
                <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-xs">
                  {c.flag}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{name || "Your token name"}</p>
                <p className="num text-xs text-muted-foreground">
                  {ticker || "TICKER"} · rewards in {c.code} {c.symbol}
                </p>
              </div>
            </div>
            <p className="mt-4 min-h-[40px] text-sm text-muted-foreground">
              {desc || "Your description shows up here for every trader who opens the coin."}
            </p>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>Bonding curve</span>
                <span className="num">0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                 <div className="h-full w-0 rounded-full bg-[image:var(--gradient-primary)]" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
              <div className="rounded-lg bg-secondary/60 py-2">
                <Globe className="mx-auto size-3.5" />
              </div>
              <div className="rounded-lg bg-secondary/60 py-2">
                <Twitter className="mx-auto size-3.5" />
              </div>
              <div className="rounded-lg bg-secondary/60 py-2">
                <Send className="mx-auto size-3.5" />
              </div>
            </div>
          </div>

          {!isConnected ? (
            <div className="glass-soft mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm">
              <Wallet className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Connect a wallet to launch</p>
                <p className="text-xs text-muted-foreground">
                  Launching signs one transaction on Robinhood Chain. Use the Connect wallet button in the top
                  right, or from any page.
                </p>
              </div>
            </div>
          ) : !onRightChain ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">Switch to Robinhood Chain</p>
                <p className="text-xs opacity-90">
                  Bankpad only launches on chain {robinhoodChain.id}. Click the network chip in your wallet
                  to switch, or press Launch and we'll prompt you.
                </p>
              </div>
            </div>
          ) : !currencyLaunchable ? (
            <div className="glass-soft mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Pick a launchable reward currency</p>
                <p className="text-xs text-muted-foreground">
                  {pair} is on the roster but its reward-token contract isn't live yet. USD (USDG) is the
                  first launchable currency. More arrive as their pools clear the depth floor.
                </p>
              </div>
            </div>
          ) : null}

          <Button
            size="lg"
            disabled={busy || !formValid}
            onClick={handleLaunch}
            className="mt-5 w-full bg-[image:var(--gradient-primary)] text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Launching your coin
              </>
            ) : !isConnected ? (
              "Connect wallet to launch"
            ) : !onRightChain ? (
              "Switch and launch"
            ) : (
              `Launch ${ticker || "token"} with ${c.code} rewards`
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Liquidity locks automatically at graduation. You keep {tax.toFixed(1)}% creator tax plus your fee
            share.{" "}
            {!isConnected && (
              <Link to="/auth" search={{ next: "/launch" }} className="text-primary hover:underline">
                Learn more
              </Link>
            )}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Panel({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl border p-5 transition-colors hover:border-primary/30 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="num text-xs text-muted-foreground">{step}</span>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="num text-sm font-semibold">{value}</p>
    </div>
  );
}
