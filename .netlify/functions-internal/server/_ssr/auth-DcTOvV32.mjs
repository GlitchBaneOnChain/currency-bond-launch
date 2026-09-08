import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DcTOvV32.js
var $$splitComponentImporter = () => import("./auth-a8IHFOmG.mjs");
var Route = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Connect your wallet to Bankpad" },
		{
			name: "description",
			content: "Create your Bankpad account to launch a coin paired with a country currency, trade the bonding curve and claim creator fees."
		},
		{
			property: "og:title",
			content: "Connect your wallet to Bankpad"
		},
		{
			property: "og:description",
			content: "Create an account to launch and trade currency paired coins."
		}
	] }),
	validateSearch: (search) => typeof search["next"] === "string" ? { next: search["next"] } : {},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
