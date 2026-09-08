import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-gZoXj-5I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market.functions-BKizqEmI.js
var listTokens = createServerFn({ method: "GET" }).handler(createSsrRpc("2e42dc271bd7cc78fbf46da53e4900d802958e5f38b7e93f45f1c8223d8a5132"));
var getTokenPage = createServerFn({ method: "GET" }).inputValidator((data) => data).handler(createSsrRpc("839f6406bfa072783db77e412c5ffcd8e453c23cb39cd84035cdda3a2f066d1c"));
var getPlatformStats = createServerFn({ method: "GET" }).handler(createSsrRpc("5900b2fcc4b0f1d61631f71d76df53026f7f7a01f471ca2696a351a694be8d2f"));
//#endregion
export { getTokenPage as n, listTokens as r, getPlatformStats as t };
