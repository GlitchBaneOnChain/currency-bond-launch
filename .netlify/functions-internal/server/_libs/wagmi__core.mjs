import { B as createClient, G as ConnectorNotConnectedError, H as ChainNotConfiguredError, J as getAction, K as ConnectorUnavailableReconnectingError, L as walletActions, P as custom, U as ConnectorAccountNotFoundError, W as ConnectorChainMismatchError, X as signMessage$1, Y as init_signMessage, Z as init_utils, at as parseAccount, ct as getAddress, j as init__esm, k as deepEqual, q as BaseError, u as filterQueryOptions } from "./@rainbow-me/rainbowkit+[...].mjs";
//#region node_modules/@wagmi/core/dist/esm/actions/getConnectorClient.js
init__esm();
init_utils();
/** https://wagmi.sh/core/api/actions/getConnectorClient */
async function getConnectorClient(config, parameters = {}) {
	const { assertChainId = true } = parameters;
	let connection;
	if (parameters.connector) {
		const { connector } = parameters;
		if (config.state.status === "reconnecting" && !connector.getAccounts && !connector.getChainId) throw new ConnectorUnavailableReconnectingError({ connector });
		const [accounts, chainId] = await Promise.all([connector.getAccounts().catch((e) => {
			if (parameters.account === null) return [];
			throw e;
		}), connector.getChainId()]);
		connection = {
			accounts,
			chainId,
			connector
		};
	} else connection = config.state.connections.get(config.state.current);
	if (!connection) throw new ConnectorNotConnectedError();
	const chainId = parameters.chainId ?? connection.chainId;
	const connectorChainId = await connection.connector.getChainId();
	if (assertChainId && connectorChainId !== chainId) throw new ConnectorChainMismatchError({
		connectionChainId: chainId,
		connectorChainId
	});
	const connector = connection.connector;
	if (connector.getClient) return connector.getClient({ chainId });
	const account = parseAccount(parameters.account ?? connection.accounts[0]);
	if (account) account.address = getAddress(account.address);
	if (parameters.account && !connection.accounts.some((x) => x.toLowerCase() === account.address.toLowerCase())) throw new ConnectorAccountNotFoundError({
		address: account.address,
		connector
	});
	const chain = config.chains.find((chain) => chain.id === chainId);
	const provider = await connection.connector.getProvider({ chainId });
	return createClient({
		account,
		chain,
		name: "Connector Client",
		transport: (opts) => custom(provider)({
			...opts,
			retryCount: 0
		})
	});
}
//#endregion
//#region node_modules/@wagmi/core/dist/esm/actions/getChains.js
var previousChains = [];
/** https://wagmi.sh/core/api/actions/getChains */
function getChains(config) {
	const chains = config.chains;
	if (deepEqual(previousChains, chains)) return previousChains;
	previousChains = chains;
	return chains;
}
//#endregion
//#region node_modules/@wagmi/core/dist/esm/actions/getWalletClient.js
init__esm();
async function getWalletClient(config, parameters = {}) {
	return (await getConnectorClient(config, parameters)).extend(walletActions);
}
//#endregion
//#region node_modules/@wagmi/core/dist/esm/actions/signMessage.js
init_signMessage();
/** https://wagmi.sh/core/api/actions/signMessage */
async function signMessage(config, parameters) {
	const { account, connector, ...rest } = parameters;
	let client;
	if (typeof account === "object" && account.type === "local") client = config.getClient();
	else client = await getConnectorClient(config, {
		account,
		connector
	});
	return getAction(client, signMessage$1, "signMessage")({
		...rest,
		...account ? { account } : {}
	});
}
//#endregion
//#region node_modules/@wagmi/core/dist/esm/errors/connector.js
var SwitchChainNotSupportedError = class extends BaseError {
	constructor({ connector }) {
		super(`"${connector.name}" does not support programmatic chain switching.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "SwitchChainNotSupportedError"
		});
	}
};
//#endregion
//#region node_modules/@wagmi/core/dist/esm/actions/switchChain.js
/** https://wagmi.sh/core/api/actions/switchChain */
async function switchChain(config, parameters) {
	const { addEthereumChainParameter, chainId } = parameters;
	const connection = config.state.connections.get(parameters.connector?.uid ?? config.state.current);
	if (connection) {
		const connector = connection.connector;
		if (!connector.switchChain) throw new SwitchChainNotSupportedError({ connector });
		return await connector.switchChain({
			addEthereumChainParameter,
			chainId
		});
	}
	const chain = config.chains.find((x) => x.id === chainId);
	if (!chain) throw new ChainNotConfiguredError();
	config.setState((x) => ({
		...x,
		chainId
	}));
	return chain;
}
//#endregion
//#region node_modules/@wagmi/core/dist/esm/actions/watchChains.js
/**
* @internal
* We don't expose this because as far as consumers know, you can't chainge (lol) `config.chains` at runtime.
* Setting `config.chains` via `config._internal.chains.setState(...)` is an extremely advanced use case that's not worth documenting or supporting in the public API at this time.
*/
function watchChains(config, parameters) {
	const { onChange } = parameters;
	return config._internal.chains.subscribe((chains, prevChains) => {
		onChange(chains, prevChains);
	});
}
//#endregion
//#region node_modules/@wagmi/core/dist/esm/query/getWalletClient.js
function getWalletClientQueryOptions(config, options = {}) {
	return {
		gcTime: 0,
		async queryFn({ queryKey }) {
			const { connector } = options;
			const { connectorUid: _, scopeKey: _s, ...parameters } = queryKey[1];
			return getWalletClient(config, {
				...parameters,
				connector
			});
		},
		queryKey: getWalletClientQueryKey(options)
	};
}
function getWalletClientQueryKey(options = {}) {
	const { connector, ...parameters } = options;
	return ["walletClient", {
		...filterQueryOptions(parameters),
		connectorUid: connector?.uid
	}];
}
//#endregion
//#region node_modules/@wagmi/core/dist/esm/query/switchChain.js
function switchChainMutationOptions(config) {
	return {
		mutationFn(variables) {
			return switchChain(config, variables);
		},
		mutationKey: ["switchChain"]
	};
}
//#endregion
export { getChains as a, signMessage as i, getWalletClientQueryOptions as n, watchChains as r, switchChainMutationOptions as t };
