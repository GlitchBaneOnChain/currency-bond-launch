import { Link } from "@tanstack/react-router";
import { currency, compact, type Token } from "@/lib/mock-data";

export function TokenCard({ token }: { token: Token }) {
  const c = currency(token.pair);
  const up = token.change24h >= 0;

  return (
    <Link
      to="/token/$address"
      params={{ address: token.address }}
      className="glass-panel group relative flex flex-col rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <span className="flex size-12 items-center justify-center rounded-lg bg-secondary text-2xl">
            {token.emoji}
          </span>
          <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-xs">
            {c.flag}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{token.name}</p>
            {token.graduated && (
              <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                Graduated
              </span>
            )}
          </div>
          <p className="num text-xs text-muted-foreground">
            {token.ticker} / {c.code} · {token.createdAgo}
          </p>
        </div>
        <span className={`num text-sm font-semibold ${up ? "text-success" : "text-destructive"}`}>
          {up ? "+" : ""}
          {token.change24h.toFixed(1)}%
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{token.description}</p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Mkt cap" value={`${c.symbol}${compact(token.marketCap)}`} />
        <Stat label="Volume 24h" value={`${c.symbol}${compact(token.volume24h)}`} />
        <Stat label="Holders" value={compact(token.holders)} />
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{token.graduated ? "Locked Uniswap V4 pool" : "Bonding curve"}</span>
          <span className="num">{token.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-700 ${token.graduated ? "bg-[image:var(--gradient-gold)]" : "bg-[image:var(--gradient-blue)]"}`}
            style={{ width: `${token.progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/60 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="num text-xs font-semibold">{value}</p>
    </div>
  );
}
