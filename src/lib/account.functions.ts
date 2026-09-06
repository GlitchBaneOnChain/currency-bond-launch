import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CURRENCY_CODES, type TokenRow } from "@/lib/market";

function randomAddress() {
  const hex = "0123456789abcdef";
  let out = "0x";
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += (hex[b >> 4] ?? "0") + (hex[b & 15] ?? "0");
  return out;
}

export type AccountSummary = {
  displayName: string;
  balances: { currency: string; amount: number }[];
  myTokens: TokenRow[];
  holdings: { tokenId: string; amount: number }[];
};

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountSummary> => {
    const { supabase, userId } = context;
    const [profile, balances, tokens, holdings] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
      supabase.from("balances").select("currency, amount").eq("user_id", userId),
      supabase.from("token_market").select("*").eq("creator_id", userId).order("created_at", { ascending: false }),
      supabase.from("holdings").select("token_id, amount").eq("user_id", userId).gt("amount", 0),
    ]);
    return {
      displayName: ((profile.data as { display_name?: string } | null)?.display_name) ?? "Anonymous",
      balances: ((balances.data ?? []) as unknown as { currency: string; amount: number }[]).map((b) => ({
        currency: b.currency,
        amount: Number(b.amount),
      })),
      myTokens: (tokens.data ?? []) as unknown as TokenRow[],
      holdings: ((holdings.data ?? []) as unknown as { token_id: string; amount: number }[]).map((h) => ({
        tokenId: h.token_id,
        amount: Number(h.amount),
      })),
    };
  });

export type LaunchInput = {
  name: string;
  ticker: string;
  emoji: string;
  pair: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  creatorTaxBps: number;
};

export const launchToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: LaunchInput) => {
    const name = data.name.trim();
    const ticker = data.ticker.trim().toUpperCase();
    if (name.length < 2 || name.length > 40) throw new Error("Give your coin a name between 2 and 40 characters");
    if (!/^[A-Z0-9]{2,8}$/.test(ticker)) throw new Error("Ticker must be 2 to 8 letters or numbers");
    if (!CURRENCY_CODES.includes(data.pair)) throw new Error("Pick a supported currency");
    const bps = Math.round(data.creatorTaxBps);
    if (bps < 0 || bps > 500) throw new Error("Creator tax must be between 0 and 5 percent");
    return {
      name,
      ticker,
      emoji: data.emoji || "🏦",
      pair: data.pair,
      description: data.description.trim().slice(0, 280),
      website: data.website.trim(),
      twitter: data.twitter.trim(),
      telegram: data.telegram.trim(),
      creatorTaxBps: bps,
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("tokens")
      .insert({
        address: randomAddress(),
        name: data.name,
        ticker: data.ticker,
        emoji: data.emoji,
        pair: data.pair,
        description: data.description,
        website: data.website || null,
        twitter: data.twitter || null,
        telegram: data.telegram || null,
        creator_id: userId,
        creator_tax_bps: data.creatorTaxBps,
      })
      .select("address")
      .single();
    if (error) throw new Error(error.message);
    return { address: (row as { address: string }).address };
  });

export const tradeToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tokenId: string; side: "buy" | "sell"; amount: number }) => {
    if (!data.tokenId) throw new Error("Missing coin");
    if (!(data.amount > 0)) throw new Error("Enter an amount greater than zero");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("execute_trade", {
      p_token_id: data.tokenId,
      p_side: data.side,
      p_amount: data.amount,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const claimFees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tokenId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: claimed, error } = await context.supabase.rpc("claim_creator_fees", {
      p_token_id: data.tokenId,
    });
    if (error) throw new Error(error.message);
    return { claimed: Number(claimed ?? 0) };
  });
