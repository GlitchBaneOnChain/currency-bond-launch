import { a as __toESM } from "../_runtime.mjs";
import { s as require_react } from "./@radix-ui/react-collection+[...].mjs";
import { D as useAccount, O as useConfig, i as useMutation, l as useQueryClient, n as useChainId, r as useQuery } from "./@rainbow-me/rainbowkit+[...].mjs";
import { a as getChains, n as getWalletClientQueryOptions, r as watchChains, t as switchChainMutationOptions } from "./wagmi__core.mjs";
//#region node_modules/wagmi/dist/esm/hooks/useChains.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** https://wagmi.sh/react/api/hooks/useChains */
function useChains(parameters = {}) {
	const config = useConfig(parameters);
	return (0, import_react.useSyncExternalStore)((onChange) => watchChains(config, { onChange }), () => getChains(config), () => getChains(config));
}
//#endregion
//#region node_modules/wagmi/dist/esm/hooks/useSwitchChain.js
/** https://wagmi.sh/react/api/hooks/useSwitchChain */
function useSwitchChain(parameters = {}) {
	const { mutation } = parameters;
	const config = useConfig(parameters);
	const mutationOptions = switchChainMutationOptions(config);
	const { mutate, mutateAsync, ...result } = useMutation({
		...mutation,
		...mutationOptions
	});
	return {
		...result,
		chains: useChains({ config }),
		switchChain: mutate,
		switchChainAsync: mutateAsync
	};
}
//#endregion
//#region node_modules/wagmi/dist/esm/hooks/useWalletClient.js
/** https://wagmi.sh/react/api/hooks/useWalletClient */
function useWalletClient(parameters = {}) {
	const { query = {}, ...rest } = parameters;
	const config = useConfig(rest);
	const queryClient = useQueryClient();
	const { address, connector, status } = useAccount({ config });
	const chainId = useChainId({ config });
	const activeConnector = parameters.connector ?? connector;
	const { queryKey, ...options } = getWalletClientQueryOptions(config, {
		...parameters,
		chainId: parameters.chainId ?? chainId,
		connector: parameters.connector ?? connector
	});
	const enabled = Boolean((status === "connected" || status === "reconnecting" && activeConnector?.getProvider) && (query.enabled ?? true));
	const addressRef = (0, import_react.useRef)(address);
	(0, import_react.useEffect)(() => {
		const previousAddress = addressRef.current;
		if (!address && previousAddress) {
			queryClient.removeQueries({ queryKey });
			addressRef.current = void 0;
		} else if (address !== previousAddress) {
			queryClient.invalidateQueries({ queryKey });
			addressRef.current = address;
		}
	}, [address, queryClient]);
	return useQuery({
		...query,
		...options,
		queryKey,
		enabled,
		staleTime: Number.POSITIVE_INFINITY
	});
}
//#endregion
export { useSwitchChain as n, useWalletClient as t };
