import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { TokenCard } from "@/components/site/token-card";
import { Input } from "@/components/ui/input";
import { CURRENCIES, toTokenView } from "@/lib/market";
import { listTokens } from "@/lib/market.functions";

const exploreQuery = queryOptions({
  queryKey: ["tokens"],
  queryFn: () => listTokens(),
});

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): { currency?: string } =>
    typeof search["currency"] === "string" ? { currency: search["currency"] } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(exploreQuery),
  head: () => ({
    meta: [
      { title: "Explore launches on Bankpad" },
      {
        name: "description",
        content:
          "Browse every Bankpad launch by country currency, graduation status, volume and age.",
      },
      { property: "og:title", content: "Explore launches on Bankpad" },
      {
        property: "og:description",
        content: "Filter all Bankpad tokens by reward currency, graduation status and volume.",
      },
    ],
  }),
  component: Explore,
});

type Status = "all" | "graduated" | "curve";
type Sort = "newest" | "volume" | "marketcap" | "progress";

function Explore() {
  const { data } = useSuspenseQuery(exploreQuery);
  const all = useMemo(() => data.tokens.map(toTokenView), [data]);
  const [q, setQ] = useState("");
  const search = Route.useSearch();
  const [pair, setPair] = useState(search.currency ?? "ALL");
  const [status, setStatus] = useState<Status>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const list = useMemo(() => {
    let out = all.filter((t) => {
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
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return out;
  }, [all, q, pair, status, sort]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="section-glow border-b border-border/60 bg-vault/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Explore all launches</h1>
          <p className="mt-2 text-muted-foreground">
            {all.length === 0
              ? `No coins yet. ${CURRENCIES.length} national currencies are ready for the first launch.`
              : `${all.length} ${all.length === 1 ? "coin" : "coins"} across ${CURRENCIES.length} national currencies.`}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="glass-panel rounded-2xl border p-4 shadow-[var(--shadow-glow)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or ticker"
              className="glass-control border-input pl-9"
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
               <Chip key={k} active={sort === k} onClick={() => setSort(k)}>
                {label}
              </Chip>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="glass-soft mt-10 rounded-2xl border border-dashed py-20 text-center">
            <p className="font-semibold">
              {all.length === 0 ? "No coins have launched yet" : "No launches match those filters"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {all.length === 0
                ? "Head to the launch page to mint the very first Bankpad coin."
                : "Try a different currency or clear the search."}
            </p>
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
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const on = "border-primary/50 bg-primary/15 text-primary";
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 ${
        active ? on : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
