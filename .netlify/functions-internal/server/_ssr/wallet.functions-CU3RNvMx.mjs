import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet.functions-CU3RNvMx.js
var DOMAIN = "bankpad.app";
function normalize(address) {
	if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("That does not look like a wallet address");
	return address.toLowerCase();
}
function shortAddress(address) {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
function walletMessage(address, nonce) {
	return `Bankpad wants you to sign in with your wallet.\n\nWallet: ${address}\nCode: ${nonce}\n\nSigning is free and does not move any funds.`;
}
var requestWalletNonce_createServerFn_handler = createServerRpc({
	id: "39e12e24bf91dfe527cf527c95de1d7d2471184e691e4edcd465af9299d510cf",
	name: "requestWalletNonce",
	filename: "src/lib/wallet.functions.ts"
}, (opts) => requestWalletNonce.__executeServer(opts));
var requestWalletNonce = createServerFn({ method: "POST" }).inputValidator((data) => ({ address: normalize(data.address) })).handler(requestWalletNonce_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-ksuumjN1.mjs");
	const nonce = crypto.randomUUID().replace(/-/g, "");
	const { error } = await supabaseAdmin.from("wallet_challenges").upsert({
		address: data.address,
		nonce,
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (error) throw new Error(error.message);
	return { message: walletMessage(data.address, nonce) };
});
var verifyWallet_createServerFn_handler = createServerRpc({
	id: "542a8d93aa18e20b9a1ca18b0ec5942cf41bd4d9b725713c4596b9b214ae05e5",
	name: "verifyWallet",
	filename: "src/lib/wallet.functions.ts"
}, (opts) => verifyWallet.__executeServer(opts));
var verifyWallet = createServerFn({ method: "POST" }).inputValidator((data) => ({
	address: normalize(data.address),
	signature: data.signature
})).handler(verifyWallet_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-ksuumjN1.mjs");
	const { verifyMessage } = await import("../_libs/@rainbow-me/rainbowkit+[...].mjs").then((n) => (n.j(), n.A));
	const { data: challenge } = await supabaseAdmin.from("wallet_challenges").select("nonce, created_at").eq("address", data.address).maybeSingle();
	const row = challenge;
	if (!row) throw new Error("Start the wallet connection again");
	if (Date.now() - new Date(row.created_at).getTime() > 6e5) throw new Error("That signing request expired. Try again.");
	if (!await verifyMessage({
		address: data.address,
		message: walletMessage(data.address, row.nonce),
		signature: data.signature
	})) throw new Error("That signature did not match the wallet");
	await supabaseAdmin.from("wallet_challenges").delete().eq("address", data.address);
	const email = `${data.address}@wallet.${DOMAIN}`;
	const { data: existing } = await supabaseAdmin.from("profiles").select("id").eq("wallet_address", data.address).maybeSingle();
	let userId = existing?.id ?? null;
	if (!userId) {
		const created = await supabaseAdmin.auth.admin.createUser({
			email,
			email_confirm: true,
			user_metadata: {
				display_name: shortAddress(data.address),
				wallet_address: data.address
			}
		});
		if (created.error) {
			if (!created.error.message.toLowerCase().includes("already")) throw new Error(created.error.message);
		}
		userId = created.data.user?.id ?? null;
		if (!userId) userId = (await supabaseAdmin.auth.admin.listUsers({
			page: 1,
			perPage: 200
		})).data.users.find((u) => u.email === email)?.id ?? null;
		if (!userId) throw new Error("Could not open an account for that wallet");
		await supabaseAdmin.from("profiles").upsert({
			id: userId,
			display_name: shortAddress(data.address),
			wallet_address: data.address
		});
	}
	const link = await supabaseAdmin.auth.admin.generateLink({
		type: "magiclink",
		email
	});
	if (link.error) throw new Error(link.error.message);
	const tokenHash = link.data.properties?.hashed_token;
	if (!tokenHash) throw new Error("Could not finish signing you in");
	return {
		tokenHash,
		displayName: shortAddress(data.address)
	};
});
//#endregion
export { requestWalletNonce_createServerFn_handler, verifyWallet_createServerFn_handler };
