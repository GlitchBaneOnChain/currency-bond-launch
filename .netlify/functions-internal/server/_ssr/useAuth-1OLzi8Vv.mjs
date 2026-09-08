import { a as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-WRWtFchz.mjs";
import { s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as useQuery, l as useQueryClient } from "../_libs/@rainbow-me/rainbowkit+[...].mjs";
import { a as useServerFn, n as getAccount } from "./account.functions-kabeejl8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useAuth-1OLzi8Vv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAuth() {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user ?? null);
			if (event === "SIGNED_IN" || event === "SIGNED_OUT") queryClient.invalidateQueries({ queryKey: ["account"] });
		});
		supabase.auth.getSession().then(({ data }) => {
			setUser(data.session?.user ?? null);
			setLoading(false);
		});
		return () => subscription.unsubscribe();
	}, [queryClient]);
	return {
		user,
		loading
	};
}
function useAccount() {
	const { user } = useAuth();
	const fetchAccount = useServerFn(getAccount);
	return useQuery({
		queryKey: ["account", user?.id ?? "anon"],
		queryFn: () => fetchAccount(),
		enabled: Boolean(user)
	});
}
//#endregion
export { useAuth as n, useAccount as t };
