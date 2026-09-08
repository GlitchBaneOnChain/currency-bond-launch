import { t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { r as listTokens, t as getPlatformStats } from "./market.functions-BKizqEmI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-dygQ_vq_.js
var homeQuery = queryOptions({
	queryKey: ["home"],
	queryFn: async () => {
		const [{ tokens }, stats] = await Promise.all([listTokens(), getPlatformStats()]);
		return {
			tokens,
			stats
		};
	}
});
//#endregion
export { homeQuery as t };
