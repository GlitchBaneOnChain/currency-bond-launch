import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { TokenCard } from "@/components/site/token-card";
import { Input } from "@/components/ui/input";
import { CURRENCIES, TOKENS } from "@/lib/mock-data";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore launches — Bankpad" },
      {
        name: "description",
        content:
          "Browse every Bankpad launch by country currency, graduation status, volume and age. PEPE / USD, DOGE / EUR and more.",
      },
      { property: "og:title", content: "Explore launches — Bankpad" },
      {
        property: "og:description",
        content: "Filter all Bankpad tokens by currency pair, graduation status and volume.",
      },
    ],
  }),
  component: Explore,
});

type Status = "all" | "graduated" | "curve";
type Sort = "newest" | "volume" | "marketcap" | "progress";

function Explore() {
  const [q, setQ] = useState("");
  const [pair, setPair] = useState("ALL");
  const [status, setStatus] = useState<Status>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const list = useMemo(() => {
    let out = TOKENS.filter((t) => {
      if (pair !== "ALL" && t.pair !== pair) return false;
      if (status === "graduated" && !t.graduated) return false;
      if (status === "curve" && t.graduated) return false;
      if (q && !`${t.name} ${t.ticker}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "volume") return b.volume24h - a.volume24h;
      if (sort === "marketcap") return b.marketCap - a.marketCap;
      if (sort === "progress") return b.progress - a.progress;
      return 0;
    });
    return out;
  }, [q, pair, status, sort]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="border-b border-border/60 bg-vault">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Explore all launches</h1>
          <p className="mt-2 text-muted-foreground">
            {TOKENS.length} coins across {CURRENCIES.length} national currencies.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or ticker"
              className="border-input bg-background pl-9"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active={pair === "ALL"} onClick={() => setPair("ALL")}>
              All currencies
            </Chip>
            {CURRENCIES.map((c) => (
              <Chip key={c.code} active={pair === c.code} onClick={() => setPair(c.code)}>
                <span className="mr-1">{c.flag}</span>
                {c.code}
              </Chip>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            {(
              [
                ["all", "All"],
                ["curve", "On curve"],
                ["graduated", "Graduated"],
              ] as [Status, string][]
            ).map(([k, label]) => (
              <Chip key={k} active={status === k} onClick={() => setStatus(k)}>
                {label}
              </Chip>
            ))}
            <span className="mx-2 hidden h-5 w-px bg-border sm:block" />
            {(
              [
                ["newest", "Newest"],
                ["volume", "Volume"],
                ["marketcap", "Market cap"],
                ["progress", "Progress"],
              ] as [Sort, string][]
            ).map(([k, label]) => (
              <Chip key={k} active={sort === k} onClick={() => setSort(k)} gold>
                {label}
              </Chip>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="font-semibold">No launches match those filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different currency or clear the search.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => (
              <TokenCard key={t.address} token={t} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Chip({
  active,
  gold,
  onClick,
  children,
}: {
  active: boolean;
  gold?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const on = gold ? "border-gold/50 bg-gold/15 text-gold" : "border-primary/50 bg-primary/15 text-primary";
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? on : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
