import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-MrPFS4A9.mjs";
import { n as CURRENCY_CODES } from "./market-qqUb7Jkc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account.functions-_yQoSDeP.js
function randomAddress() {
	const hex = "0123456789abcdef";
	let out = "0x";
	const bytes = /* @__PURE__ */ new Uint8Array(20);
	crypto.getRandomValues(bytes);
	for (const b of bytes) out += (hex[b >> 4] ?? "0") + (hex[b & 15] ?? "0");
	return out;
}
var getAccount_createServerFn_handler = createServerRpc({
	id: "42d3d3d7c5da8c3606b6f6bb01d5a2468982684501464f1133a9e48c3c43c27c",
	name: "getAccount",
	filename: "src/lib/account.functions.ts"
}, (opts) => getAccount.__executeServer(opts));
var getAccount = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAccount_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const [profile, balances, tokens, holdings] = await Promise.all([
		supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
		supabase.from("balances").select("currency, amount").eq("user_id", userId),
		supabase.from("token_market").select("*").eq("creator_id", userId).order("created_at", { ascending: false }),
		supabase.from("holdings").select("token_id, amount").eq("user_id", userId).gt("amount", 0)
	]);
	return {
		displayName: profile.data?.display_name ?? "Anonymous",
		balances: (balances.data ?? []).map((b) => ({
			currency: b.currency,
			amount: Number(b.amount)
		})),
		myTokens: tokens.data ?? [],
		holdings: (holdings.data ?? []).map((h) => ({
			tokenId: h.token_id,
			amount: Number(h.amount)
		}))
	};
});
function isHexAddress(s) {
	return /^0x[a-fA-F0-9]{40}$/.test(s);
}
function isTxHash(s) {
	return /^0x[a-fA-F0-9]{64}$/.test(s);
}
var launchToken_createServerFn_handler = createServerRpc({
	id: "7f5be7de2ffb5b822fbcf5aa0d54ec6e8886a85581bf5e47c506004ecae0f35b",
	name: "launchToken",
	filename: "src/lib/account.functions.ts"
}, (opts) => launchToken.__executeServer(opts));
var launchToken = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	const name = data.name.trim();
	const ticker = data.ticker.trim().toUpperCase();
	if (name.length < 2 || name.length > 40) throw new Error("Give your coin a name between 2 and 40 characters");
	if (!/^[A-Z0-9]{2,8}$/.test(ticker)) throw new Error("Ticker must be 2 to 8 letters or numbers");
	if (!CURRENCY_CODES.includes(data.pair)) throw new Error("Pick a supported currency");
	const bps = Math.round(data.creatorTaxBps);
	if (bps < 0 || bps > 500) throw new Error("Creator tax must be between 0 and 5 percent");
	if (data.onChainAddress !== void 0 && !isHexAddress(data.onChainAddress)) throw new Error("On-chain address is not a valid EVM address");
	if (data.launchTxHash !== void 0 && !isTxHash(data.launchTxHash)) throw new Error("Launch tx hash must be a 0x-prefixed 32-byte hex string");
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
		...data.onChainAddress ? { onChainAddress: data.onChainAddress } : {},
		...data.launchTxHash ? { launchTxHash: data.launchTxHash } : {}
	};
}).handler(launchToken_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const address = data.onChainAddress ?? randomAddress();
	const { data: row, error } = await supabase.from("tokens").insert({
		address,
		name: data.name,
		ticker: data.ticker,
		emoji: data.emoji,
		pair: data.pair,
		description: data.description,
		website: data.website || null,
		twitter: data.twitter || null,
		telegram: data.telegram || null,
		creator_id: userId,
		creator_tax_bps: data.creatorTaxBps
	}).select("address").single();
	if (error) throw new Error(error.message);
	return { address: row.address };
});
var tradeToken_createServerFn_handler = createServerRpc({
	id: "97ef4b84befa94ba4289f6e66d87fbb76f0887d60012b3d7779424fa093b291b",
	name: "tradeToken",
	filename: "src/lib/account.functions.ts"
}, (opts) => tradeToken.__executeServer(opts));
var tradeToken = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.tokenId) throw new Error("Missing coin");
	if (!(data.amount > 0)) throw new Error("Enter an amount greater than zero");
	return data;
}).handler(tradeToken_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.supabase.rpc("execute_trade", {
		p_token_id: data.tokenId,
		p_side: data.side,
		p_amount: data.amount
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
var claimFees_createServerFn_handler = createServerRpc({
	id: "fe346c492f39ab2074572301e70bee48000b1d24194800274eec964454a23aae",
	name: "claimFees",
	filename: "src/lib/account.functions.ts"
}, (opts) => claimFees.__executeServer(opts));
var claimFees = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(claimFees_createServerFn_handler, async ({ data, context }) => {
	const { data: claimed, error } = await context.supabase.rpc("claim_creator_fees", { p_token_id: data.tokenId });
	if (error) throw new Error(error.message);
	return { claimed: Number(claimed ?? 0) };
});
//#endregion
export { claimFees_createServerFn_handler, getAccount_createServerFn_handler, launchToken_createServerFn_handler, tradeToken_createServerFn_handler };
