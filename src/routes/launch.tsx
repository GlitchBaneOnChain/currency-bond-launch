import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Globe, ImagePlus, Info, Loader2, Send, Twitter } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { CURRENCIES, currency } from "@/lib/mock-data";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Launch a token — Bankpad" },
      {
        name: "description",
        content:
          "Mint your coin on Bankpad in under a minute: pick a national currency pair, set a creator tax, and deploy on Robinhood Chain.",
      },
      { property: "og:title", content: "Launch a token — Bankpad" },
      {
        property: "og:description",
        content: "Pick a country currency, set your creator tax, and launch on the bonding curve.",
      },
    ],
  }),
  component: LaunchPage,
});

function LaunchPage() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [desc, setDesc] = useState("");
  const [pair, setPair] = useState("USD");
  const [tax, setTax] = useState(1);
  const [logo, setLogo] = useState("🏦");
  const [state, setState] = useState<"idle" | "launching" | "done">("idle");

  const c = currency(pair);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="border-b border-border/60 bg-vault">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Open a new coin</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every Bankpad coin trades against a real national currency. Fill in the paperwork, and the vault
            handles the rest.
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
                  className="bg-background"
                />
              </Field>
              <Field label="Ticker">
                <Input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 8))}
                  placeholder="PEPE"
                  className="num bg-background uppercase"
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 280))}
                placeholder="Tell holders what this coin stands for."
                rows={4}
                className="resize-none bg-background"
              />
              <p className="num mt-1 text-right text-[11px] text-muted-foreground">{desc.length}/280</p>
            </Field>
            <Field label="Logo">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-xl border border-dashed border-border bg-background text-3xl">
                  {logo}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {["🏦", "🐸", "🐕", "🚀", "💷", "🦁", "🍣", "🥖"].map((e) => (
                      <button
                        key={e}
                        onClick={() => setLogo(e)}
                        className={`size-9 rounded-lg border text-lg transition-colors ${
                          logo === e ? "border-gold bg-gold/15" : "border-border bg-secondary/50"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <button className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <ImagePlus className="size-3.5" /> Upload custom image
                  </button>
                </div>
              </div>
            </Field>
          </Panel>

          <Panel title="Currency pair" step="02">
            <p className="-mt-2 mb-4 text-sm text-muted-foreground">
              Choose the national currency your coin trades against.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  onClick={() => setPair(cur.code)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                    pair === cur.code
                      ? "border-gold/60 bg-gold/10 shadow-[var(--shadow-vault)]"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <span className="text-xl">{cur.flag}</span>
                  <span className="min-w-0">
                    <span className="num block text-sm font-semibold">{cur.code}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{cur.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Links and creator tax" step="03">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Website">
                <Input placeholder="https://" className="bg-background" />
              </Field>
              <Field label="Twitter">
                <Input placeholder="https://x.com/" className="bg-background" />
              </Field>
              <Field label="Telegram">
                <Input placeholder="https://t.me/" className="bg-background" />
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

          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Info className="size-4 text-gold" /> Fees
            </p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <FeeRow label="Launch fee" value={`${c.symbol}2.00`} />
              <FeeRow label="Trading fee" value="1.0%" />
              <FeeRow label="Split" value="60% creator / 40% protocol" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Live preview
          </p>
          <div className="vault-surface rounded-2xl border border-border/70 p-5">
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
                  {ticker || "TICKER"} / {c.code}
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
                <div className="h-full w-0 rounded-full bg-[image:var(--gradient-blue)]" />
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

          <Button
            size="lg"
            disabled={state !== "idle"}
            onClick={() => {
              setState("launching");
              setTimeout(() => setState("done"), 2000);
            }}
            className="mt-5 w-full bg-[image:var(--gradient-gold)] text-base font-semibold text-gold-foreground transition-transform hover:scale-[1.02]"
          >
            {state === "launching" && (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Launching...
              </>
            )}
            {state === "done" && (
              <>
                <Check className="mr-2 size-4" /> Launched
              </>
            )}
            {state === "idle" && `Launch ${ticker || "token"} / ${c.code}`}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Liquidity locks automatically at graduation. You keep {tax.toFixed(1)}% creator tax plus your fee
            share.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Panel({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
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
