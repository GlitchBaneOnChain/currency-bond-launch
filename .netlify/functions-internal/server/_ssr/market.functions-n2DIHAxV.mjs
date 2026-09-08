import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market.functions-n2DIHAxV.js
function publicClient() {
	const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
	const url = process.env["SUPABASE_URL"];
	return createClient(url, key, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		},
		global: { fetch: (input, init) => {
			const h = new Headers(init?.headers);
			if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
			h.set("apikey", key);
			return fetch(input, {
				...init,
				headers: h
			});
		} }
	});
}
var listTokens_createServerFn_handler = createServerRpc({
	id: "2e42dc271bd7cc78fbf46da53e4900d802958e5f38b7e93f45f1c8223d8a5132",
	name: "listTokens",
	filename: "src/lib/market.functions.ts"
}, (opts) => listTokens.__executeServer(opts));
var listTokens = createServerFn({ method: "GET" }).handler(listTokens_createServerFn_handler, async () => {
	const { data, error } = await publicClient().from("token_market").select("*").order("created_at", { ascending: false }).limit(200);
	if (error) throw new Error(error.message);
	return { tokens: data ?? [] };
});
var getTokenPage_createServerFn_handler = createServerRpc({
	id: "839f6406bfa072783db77e412c5ffcd8e453c23cb39cd84035cdda3a2f066d1c",
	name: "getTokenPage",
	filename: "src/lib/market.functions.ts"
}, (opts) => getTokenPage.__executeServer(opts));
var getTokenPage = createServerFn({ method: "GET" }).inputValidator((data) => data).handler(getTokenPage_createServerFn_handler, async ({ data }) => {
	const supabase = publicClient();
	const { data: found, error } = await supabase.from("token_market").select("*").eq("address", data.address).maybeSingle();
	if (error) throw new Error(error.message);
	const token = found ?? null;
	if (!token) return {
		token: null,
		trades: []
	};
	const { data: trades } = await supabase.from("trades").select("id, side, currency_amount, token_amount, price, created_at").eq("token_id", token.id).order("created_at", { ascending: false }).limit(120);
	return {
		token,
		trades: trades ?? []
	};
});
var getPlatformStats_createServerFn_handler = createServerRpc({
	id: "5900b2fcc4b0f1d61631f71d76df53026f7f7a01f471ca2696a351a694be8d2f",
	name: "getPlatformStats",
	filename: "src/lib/market.functions.ts"
}, (opts) => getPlatformStats.__executeServer(opts));
var getPlatformStats = createServerFn({ method: "GET" }).handler(getPlatformStats_createServerFn_handler, async () => {
	const supabase = publicClient();
	const [{ count: launches }, { data: tokens }, { data: trades }] = await Promise.all([
		supabase.from("tokens").select("id", {
			count: "exact",
			head: true
		}),
		supabase.from("token_market").select("pair, fees_accrued"),
		supabase.from("trades").select("currency_amount")
	]);
	const rows = tokens ?? [];
	const volume = (trades ?? []).reduce((s, t) => s + Number(t.currency_amount), 0);
	const fees = rows.reduce((s, t) => s + Number(t.fees_accrued), 0);
	return {
		launches: launches ?? 0,
		volume,
		fees,
		pairsUsed: new Set(rows.map((r) => r.pair)).size
	};
});
//#endregion
export { getPlatformStats_createServerFn_handler, getTokenPage_createServerFn_handler, listTokens_createServerFn_handler };
