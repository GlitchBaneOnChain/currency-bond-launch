import { N as notFound, f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { n as getTokenPage } from "./market.functions-BKizqEmI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/token._address-CQ7YV6QL.js
var tokenQuery = (address) => queryOptions({
	queryKey: ["token", address],
	queryFn: () => getTokenPage({ data: { address } })
});
var $$splitComponentImporter = () => import("./token._address-c_nrcBE6.mjs");
var Route = createFileRoute("/token/$address")({
	loader: async ({ params, context }) => {
		const data = await context.queryClient.ensureQueryData(tokenQuery(params.address));
		if (!data.token) throw notFound();
		return data;
	},
	head: ({ loaderData }) => {
		if (!loaderData?.token) return { meta: [{ title: "Coin unavailable on Bankpad" }, {
			name: "robots",
			content: "noindex"
		}] };
		const t = loaderData.token;
		const title = `${t.name} (${t.ticker}) rewards holders in ${t.pair} on Bankpad`;
		const description = t.description || `${t.name} pays its holders rewards in ${t.pair}. Trade the bonding curve on Bankpad.`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: description
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: description
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { tokenQuery as n, Route as t };
