export type Currency = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
};

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", country: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", country: "Eurozone" },
  { code: "GBP", name: "Pound Sterling", symbol: "£", flag: "🇬🇧", country: "United Kingdom" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", country: "Japan" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", country: "Australia" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", country: "India" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭", country: "Switzerland" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", country: "Brazil" },
  { code: "KRW", name: "Korean Won", symbol: "₩", flag: "🇰🇷", country: "South Korea" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", flag: "🇲🇽", country: "Mexico" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", country: "Nigeria" },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export function currency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? (CURRENCIES[0] as Currency);
}

/** Bonding curve constants, mirrored from the database pricing functions. */
export const CURVE_TARGET = 5000;
export const CURVE_SUPPLY = 800_000_000;
export const TOTAL_SUPPLY = 1_000_000_000;
export const PROTOCOL_FEE_BPS = 40;
export const BASE_CREATOR_FEE_BPS = 60;

export type TokenView = {
  id: string;
  address: string;
  name: string;
  ticker: string;
  emoji: string;
  pair: string;
  description: string;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  creatorId: string;
  creatorName: string;
  creatorTaxBps: number;
  reserve: number;
  tokensSold: number;
  feesAccrued: number;
  feesClaimed: number;
  graduated: boolean;
  createdAt: string;
  price: number;
  holders: number;
  volume24h: number;
  change24h: number;
  marketCap: number;
  progress: number;
};

export type TokenRow = {
  id: string;
  address: string;
  name: string;
  ticker: string;
  emoji: string;
  pair: string;
  description: string;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  creator_id: string;
  creator_name: string | null;
  creator_tax_bps: number;
  reserve: number;
  tokens_sold: number;
  fees_accrued: number;
  fees_claimed: number;
  graduated: boolean;
  created_at: string;
  price: number;
  holders: number;
  volume_24h: number;
  price_24h_ago: number | null;
  progress: number;
};

export type TradeRow = {
  id: string;
  side: string;
  currency_amount: number;
  token_amount: number;
  price: number;
  created_at: string;
};

const num = (v: unknown) => (v == null ? 0 : Number(v));

export function toTokenView(row: TokenRow): TokenView {
  const price = num(row.price);
  const prev = row.price_24h_ago == null ? null : Number(row.price_24h_ago);
  return {
    id: String(row.id),
    address: String(row.address),
    name: String(row.name),
    ticker: String(row.ticker),
    emoji: String(row.emoji ?? "🏦"),
    pair: String(row.pair),
    description: String(row.description ?? ""),
    website: (row.website as string) ?? null,
    twitter: (row.twitter as string) ?? null,
    telegram: (row.telegram as string) ?? null,
    creatorId: String(row.creator_id),
    creatorName: String(row.creator_name ?? "Anonymous"),
    creatorTaxBps: num(row.creator_tax_bps),
    reserve: num(row.reserve),
    tokensSold: num(row.tokens_sold),
    feesAccrued: num(row.fees_accrued),
    feesClaimed: num(row.fees_claimed),
    graduated: Boolean(row.graduated),
    createdAt: String(row.created_at),
    price,
    holders: num(row.holders),
    volume24h: num(row.volume_24h),
    change24h: prev && prev > 0 ? ((price - prev) / prev) * 100 : 0,
    marketCap: price * TOTAL_SUPPLY,
    progress: Math.min(100, num(row.progress)),
  };
}

export function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function money(n: number, code: string) {
  const c = currency(code);
  return `${c.symbol}${compact(n)}`;
}

export function exactMoney(n: number, code: string) {
  const c = currency(code);
  return `${c.symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function tokenPrice(n: number) {
  if (n === 0) return "0";
  if (n < 0.01) return n.toPrecision(3);
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
