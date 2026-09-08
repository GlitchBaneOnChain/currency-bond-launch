//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CktHQEtu.js
var manifest = {
	"2e42dc271bd7cc78fbf46da53e4900d802958e5f38b7e93f45f1c8223d8a5132": {
		functionName: "listTokens_createServerFn_handler",
		importer: () => import("./_ssr/market.functions-n2DIHAxV.mjs")
	},
	"39e12e24bf91dfe527cf527c95de1d7d2471184e691e4edcd465af9299d510cf": {
		functionName: "requestWalletNonce_createServerFn_handler",
		importer: () => import("./_ssr/wallet.functions-CU3RNvMx.mjs")
	},
	"42d3d3d7c5da8c3606b6f6bb01d5a2468982684501464f1133a9e48c3c43c27c": {
		functionName: "getAccount_createServerFn_handler",
		importer: () => import("./_ssr/account.functions-_yQoSDeP.mjs")
	},
	"542a8d93aa18e20b9a1ca18b0ec5942cf41bd4d9b725713c4596b9b214ae05e5": {
		functionName: "verifyWallet_createServerFn_handler",
		importer: () => import("./_ssr/wallet.functions-CU3RNvMx.mjs")
	},
	"5900b2fcc4b0f1d61631f71d76df53026f7f7a01f471ca2696a351a694be8d2f": {
		functionName: "getPlatformStats_createServerFn_handler",
		importer: () => import("./_ssr/market.functions-n2DIHAxV.mjs")
	},
	"7f5be7de2ffb5b822fbcf5aa0d54ec6e8886a85581bf5e47c506004ecae0f35b": {
		functionName: "launchToken_createServerFn_handler",
		importer: () => import("./_ssr/account.functions-_yQoSDeP.mjs")
	},
	"839f6406bfa072783db77e412c5ffcd8e453c23cb39cd84035cdda3a2f066d1c": {
		functionName: "getTokenPage_createServerFn_handler",
		importer: () => import("./_ssr/market.functions-n2DIHAxV.mjs")
	},
	"97ef4b84befa94ba4289f6e66d87fbb76f0887d60012b3d7779424fa093b291b": {
		functionName: "tradeToken_createServerFn_handler",
		importer: () => import("./_ssr/account.functions-_yQoSDeP.mjs")
	},
	"fe346c492f39ab2074572301e70bee48000b1d24194800274eec964454a23aae": {
		functionName: "claimFees_createServerFn_handler",
		importer: () => import("./_ssr/account.functions-_yQoSDeP.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
