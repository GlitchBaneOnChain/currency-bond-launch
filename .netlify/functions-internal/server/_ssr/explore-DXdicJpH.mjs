import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { r as listTokens } from "./market.functions-BKizqEmI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-DXdicJpH.js
var exploreQuery = queryOptions({
	queryKey: ["tokens"],
	queryFn: () => listTokens()
});
var $$splitComponentImporter = () => import("./explore-DBd6wd7v.mjs");
var Route = createFileRoute("/explore")({
	validateSearch: (search) => typeof search["currency"] === "string" ? { currency: search["currency"] } : {},
	loader: ({ context }) => context.queryClient.ensureQueryData(exploreQuery),
	head: () => ({ meta: [
		{ title: "Explore launches on Bankpad" },
		{
			name: "description",
			content: "Browse every Bankpad launch by country currency, graduation status, volume and age."
		},
		{
			property: "og:title",
			content: "Explore launches on Bankpad"
		},
		{
			property: "og:description",
			content: "Filter all Bankpad tokens by reward currency, graduation status and volume."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { exploreQuery as n, Route as t };
