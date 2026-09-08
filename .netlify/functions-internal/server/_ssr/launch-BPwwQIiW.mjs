import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/launch-BPwwQIiW.js
var $$splitComponentImporter = () => import("./launch-fjoV9ba5.mjs");
var Route = createFileRoute("/launch")({
	validateSearch: (search) => typeof search["pair"] === "string" ? { pair: search["pair"] } : {},
	head: () => ({ meta: [
		{ title: "Launch a token on Bankpad" },
		{
			name: "description",
			content: "Mint your coin on Bankpad in under a minute: pick a national reward currency, set a creator tax, and let holders earn."
		},
		{
			property: "og:title",
			content: "Launch a token on Bankpad"
		},
		{
			property: "og:description",
			content: "Pick a country currency, set your creator tax, and pay holders rewards in real money."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
