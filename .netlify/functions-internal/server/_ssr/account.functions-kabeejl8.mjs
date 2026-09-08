import { a as __toESM } from "../_runtime.mjs";
import { O as isRedirect, _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-MrPFS4A9.mjs";
import { n as CURRENCY_CODES } from "./market-qqUb7Jkc.mjs";
import { s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-gZoXj-5I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account.functions-kabeejl8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var getAccount = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("42d3d3d7c5da8c3606b6f6bb01d5a2468982684501464f1133a9e48c3c43c27c"));
function isHexAddress(s) {
	return /^0x[a-fA-F0-9]{40}$/.test(s);
}
function isTxHash(s) {
	return /^0x[a-fA-F0-9]{64}$/.test(s);
}
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
}).handler(createSsrRpc("7f5be7de2ffb5b822fbcf5aa0d54ec6e8886a85581bf5e47c506004ecae0f35b"));
var tradeToken = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.tokenId) throw new Error("Missing coin");
	if (!(data.amount > 0)) throw new Error("Enter an amount greater than zero");
	return data;
}).handler(createSsrRpc("97ef4b84befa94ba4289f6e66d87fbb76f0887d60012b3d7779424fa093b291b"));
var claimFees = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("fe346c492f39ab2074572301e70bee48000b1d24194800274eec964454a23aae"));
//#endregion
export { useServerFn as a, tradeToken as i, getAccount as n, launchToken as r, claimFees as t };
