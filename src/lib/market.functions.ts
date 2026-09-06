import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { TokenRow, TradeRow } from "@/lib/market";

function publicClient() {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  const url = process.env['SUPABASE_URL']!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listTokens = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("token_market")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return { tokens: (data ?? []) as unknown as TokenRow[] };
});

export const getTokenPage = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: found, error } = await supabase
      .from("token_market")
      .select("*")
      .eq("address", data.address)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const token = (found ?? null) as unknown as TokenRow | null;
    if (!token) return { token: null as TokenRow | null, trades: [] as TradeRow[] };

    const { data: trades } = await supabase
      .from("trades")
      .select("id, side, currency_amount, token_amount, price, created_at")
      .eq("token_id", token.id)
      .order("created_at", { ascending: false })
      .limit(120);

    return { token: token as TokenRow | null, trades: (trades ?? []) as unknown as TradeRow[] };
  });

export const getPlatformStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [{ count: launches }, { data: tokens }, { data: trades }] = await Promise.all([
    supabase.from("tokens").select("id", { count: "exact", head: true }),
    supabase.from("token_market").select("pair, fees_accrued"),
    supabase.from("trades").select("currency_amount"),
  ]);
  const rows = (tokens ?? []) as unknown as { pair: string; fees_accrued: number }[];
  const volume = ((trades ?? []) as unknown as { currency_amount: number }[]).reduce(
    (s, t) => s + Number(t.currency_amount),
    0,
  );
  const fees = rows.reduce((s, t) => s + Number(t.fees_accrued), 0);
  return {
    launches: launches ?? 0,
    volume,
    fees,
    pairsUsed: new Set(rows.map((r) => r.pair)).size,
  };
});
