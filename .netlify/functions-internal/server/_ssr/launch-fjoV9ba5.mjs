import { a as __toESM } from "../_runtime.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as currency, t as CURRENCIES } from "./market-qqUb7Jkc.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as LoaderCircle, i as TriangleAlert, m as Globe, n as Wallet, o as Send, p as Info, r as Twitter } from "../_libs/lucide-react.mjs";
import { $ as formatEther, D as useAccount, M as http, R as createPublicClient, Z as decodeEventLog, ct as keccak256, j as init__esm, l as useQueryClient, rt as encodeAbiParameters } from "../_libs/@rainbow-me/rainbowkit+[...].mjs";
import { n as useSwitchChain, t as useWalletClient } from "../_libs/wagmi.mjs";
import { a as robinhoodChain, i as cn, n as Footer, r as Navbar, t as Button } from "./footer-Blq7w5Oi.mjs";
import { t as Input } from "./input-DXH4McFR.mjs";
import { t as Label } from "./label--w-LKdRz.mjs";
import { a as useServerFn, r as launchToken } from "./account.functions-kabeejl8.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Route } from "./launch-BPwwQIiW.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/launch-fjoV9ba5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
init__esm();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
/** Public client Bankpad uses for every on-chain read (holders, prices,
* fee balances, event filters). Cached per-process. */
var _publicClient;
function getPublicClient() {
	if (!_publicClient) _publicClient = createPublicClient({
		chain: robinhoodChain,
		transport: http(),
		batch: { multicall: true }
	});
	return _publicClient;
}
var REWARD_CURRENCIES = [{
	code: "USD",
	country: "United States",
	symbol: "$",
	flag: "🇺🇸",
	tokenSymbol: "USDG",
	tokenName: "Global Dollar",
	address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
	decimals: 6,
	minPoolDepthUsd: 25e3
}];
function rewardCurrency(code) {
	return REWARD_CURRENCIES.find((c) => c.code === code);
}
/** True when a UI currency code has a launchable on-chain reward token
* behind it (the reward-currency registry names an ERC-20). The launch UI
* disables currencies where this is false. */
function isLaunchable(code) {
	return rewardCurrency(code) !== void 0;
}
/** Official Pons V1 factory on Robinhood Chain. Deploys the token, opens the
* one-sided Uniswap V3 position, and locks the NFT with the configured locker. */
var PONS_V1_FACTORY_ADDRESS = "0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB";
/** Minimal ABI for the factory calls Bankpad makes. */
var ponsV1FactoryAbi = [
	{
		type: "function",
		name: "launchToken",
		stateMutability: "payable",
		inputs: [
			{
				name: "params",
				type: "tuple",
				components: [
					{
						name: "name",
						type: "string"
					},
					{
						name: "symbol",
						type: "string"
					},
					{
						name: "logo",
						type: "string"
					},
					{
						name: "description",
						type: "string"
					},
					{
						name: "socials",
						type: "tuple",
						components: [
							{
								name: "twitter",
								type: "string"
							},
							{
								name: "telegram",
								type: "string"
							},
							{
								name: "discord",
								type: "string"
							},
							{
								name: "website",
								type: "string"
							},
							{
								name: "farcaster",
								type: "string"
							}
						]
					},
					{
						name: "feeWallet",
						type: "address"
					}
				]
			},
			{
				name: "launchConfigId",
				type: "uint256"
			},
			{
				name: "dexId",
				type: "uint256"
			},
			{
				name: "salt",
				type: "bytes32"
			}
		],
		outputs: [{
			name: "token",
			type: "address"
		}]
	},
	{
		type: "function",
		name: "launchFee",
		stateMutability: "view",
		inputs: [],
		outputs: [{
			name: "",
			type: "uint256"
		}]
	},
	{
		type: "event",
		name: "TokenLaunched",
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "token",
				type: "address"
			},
			{
				indexed: true,
				name: "deployer",
				type: "address"
			},
			{
				indexed: true,
				name: "dexFactory",
				type: "address"
			},
			{
				indexed: false,
				name: "pairToken",
				type: "address"
			},
			{
				indexed: false,
				name: "pool",
				type: "address"
			},
			{
				indexed: false,
				name: "dexId",
				type: "uint256"
			},
			{
				indexed: false,
				name: "launchConfigId",
				type: "uint256"
			},
			{
				indexed: false,
				name: "positionId",
				type: "uint256"
			},
			{
				indexed: false,
				name: "restrictionsEndBlock",
				type: "uint256"
			},
			{
				indexed: false,
				name: "initialBuyAmount",
				type: "uint256"
			}
		]
	}
];
function randomSalt(seed) {
	const source = seed ?? `${Date.now()}-${Math.random()}`;
	return keccak256(encodeAbiParameters([{ type: "string" }, { type: "string" }], ["bankpad-salt", source]));
}
/** Read the current launch fee from the V1 factory (ETH, wei). */
async function readLaunchFee() {
	return getPublicClient().readContract({
		address: PONS_V1_FACTORY_ADDRESS,
		abi: ponsV1FactoryAbi,
		functionName: "launchFee"
	});
}
/** Broadcast a launch through the V1 factory using the caller's wallet.
*
* The reward currency selection is validated against the on-chain allowlist
* before we ever ask the wallet to sign — a client-supplied unlisted currency
* is rejected here, and the backend re-checks pool depth before publishing
* the launch to the site. */
async function launchTokenTx(wallet, input) {
	if (!rewardCurrency(input.rewardCurrencyCode)) throw new Error(`Reward currency ${input.rewardCurrencyCode} is not on the allowlist`);
	const params = {
		name: input.name,
		symbol: input.symbol,
		logo: input.logo,
		description: input.description,
		feeWallet: input.feeWallet,
		socials: {
			twitter: input.socials.twitter ?? "",
			telegram: input.socials.telegram ?? "",
			discord: input.socials.discord ?? "",
			website: input.socials.website ?? "",
			farcaster: input.socials.farcaster ?? ""
		}
	};
	const salt = randomSalt(input.saltSeed);
	const launchFee = await readLaunchFee();
	const account = wallet.account;
	if (!account) throw new Error("Wallet has no active account");
	const publicClient = getPublicClient();
	const { request } = await publicClient.simulateContract({
		account,
		address: PONS_V1_FACTORY_ADDRESS,
		abi: ponsV1FactoryAbi,
		functionName: "launchToken",
		args: [
			params,
			input.launchConfigId ?? 0n,
			input.dexId ?? 0n,
			salt
		],
		value: launchFee
	});
	const txHash = await wallet.writeContract(request);
	const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
	for (const log of receipt.logs) {
		if (log.address.toLowerCase() !== "0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB".toLowerCase()) continue;
		try {
			const decoded = decodeEventLog({
				abi: ponsV1FactoryAbi,
				data: log.data,
				topics: log.topics
			});
			if (decoded.eventName === "TokenLaunched") {
				const args = decoded.args;
				return {
					token: args.token,
					pool: args.pool,
					positionId: args.positionId,
					restrictionsEndBlock: args.restrictionsEndBlock,
					txHash
				};
			}
		} catch {}
	}
	throw new Error("Launch transaction confirmed but the TokenLaunched event was not found");
}
/** Thin client for the Bankpad backend. All calls are best-effort from
* the frontend's perspective — if the backend is offline the launch flow
* still writes to Supabase and the user is not blocked. Once the backend
* is deployed the frontend URL comes from VITE_BANKPAD_API_URL. */
var API_URL = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_SUPABASE_PROJECT_ID": "kijsxazyjwzeephkgcpv",
	"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_7vE1ImztKzlEDwDcjZGBEQ_tHmrqe3m",
	"VITE_SUPABASE_URL": "https://kijsxazyjwzeephkgcpv.supabase.co"
}["VITE_BANKPAD_API_URL"]?.replace(/\/$/, "") ?? "";
/** POST /launches/register. Fire-and-forget from the launch page — the
* user's coin is already on chain by the time we call this. */
async function registerLaunch(input) {
	if (!API_URL) return;
	try {
		const res = await fetch(`${API_URL}/launches/register`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(input)
		});
		if (!res.ok) {
			const body = await res.text().catch(() => "");
			console.warn(`[bankpad] registerLaunch failed: ${res.status} ${body}`);
		}
	} catch (err) {
		console.warn("[bankpad] registerLaunch threw:", err);
	}
}
function LaunchPage() {
	const [name, setName] = (0, import_react.useState)("");
	const [ticker, setTicker] = (0, import_react.useState)("");
	const [desc, setDesc] = (0, import_react.useState)("");
	const search = Route.useSearch();
	const initialPair = search.pair && isLaunchable(search.pair) ? search.pair : "USD";
	const [pair, setPair] = (0, import_react.useState)(initialPair);
	const [tax, setTax] = (0, import_react.useState)(1);
	const [logo, setLogo] = (0, import_react.useState)("🏦");
	const [website, setWebsite] = (0, import_react.useState)("");
	const [twitter, setTwitter] = (0, import_react.useState)("");
	const [telegram, setTelegram] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [launchFeeEth, setLaunchFeeEth] = (0, import_react.useState)(null);
	const { address, isConnected, chainId } = useAccount();
	const { data: walletClient } = useWalletClient({ chainId: robinhoodChain.id });
	const { switchChainAsync } = useSwitchChain();
	const onRightChain = chainId === robinhoodChain.id;
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const submit = useServerFn(launchToken);
	const c = currency(pair);
	const currencyLaunchable = isLaunchable(pair);
	(0, import_react.useEffect)(() => {
		if (!onRightChain) return;
		let alive = true;
		readLaunchFee().then((wei) => {
			if (alive) setLaunchFeeEth(formatEther(wei));
		}).catch(() => {
			if (alive) setLaunchFeeEth(null);
		});
		return () => {
			alive = false;
		};
	}, [onRightChain]);
	const formValid = (0, import_react.useMemo)(() => {
		if (name.trim().length < 2 || name.trim().length > 40) return false;
		if (!/^[A-Z0-9]{2,8}$/.test(ticker)) return false;
		if (!currencyLaunchable) return false;
		return true;
	}, [
		name,
		ticker,
		currencyLaunchable
	]);
	async function handleLaunch() {
		if (!isConnected || !address) {
			toast.error("Connect your wallet to launch a coin");
			return;
		}
		if (!currencyLaunchable) {
			toast.error(`${pair} is not launchable yet. Pick a listed currency.`);
			return;
		}
		if (!walletClient) {
			toast.error("Wallet is not ready yet. Try again in a moment.");
			return;
		}
		if (!onRightChain) try {
			await switchChainAsync({ chainId: robinhoodChain.id });
		} catch {
			toast.error("Switch to Robinhood Chain to launch");
			return;
		}
		setBusy(true);
		try {
			const onChain = await launchTokenTx(walletClient, {
				name: name.trim(),
				symbol: ticker.trim().toUpperCase(),
				logo,
				description: desc.trim().slice(0, 280),
				socials: {
					twitter: twitter.trim(),
					telegram: telegram.trim(),
					website: website.trim()
				},
				feeWallet: address,
				rewardCurrencyCode: pair
			});
			await submit({ data: {
				name: name.trim(),
				ticker: ticker.trim().toUpperCase(),
				emoji: logo,
				pair,
				description: desc.trim().slice(0, 280),
				website: website.trim(),
				twitter: twitter.trim(),
				telegram: telegram.trim(),
				creatorTaxBps: Math.round(tax * 100),
				onChainAddress: onChain.token,
				launchTxHash: onChain.txHash
			} });
			registerLaunch({
				address: onChain.token,
				name: name.trim(),
				ticker: ticker.trim().toUpperCase(),
				emoji: logo,
				description: desc.trim().slice(0, 280),
				rewardCurrencyCode: pair,
				feeWallet: address,
				poolAddress: onChain.pool,
				lockerAddress: address,
				positionId: onChain.positionId.toString(),
				launchTxHash: onChain.txHash,
				creatorAddress: address,
				creatorTaxBps: Math.round(tax * 100),
				website: website.trim() || void 0,
				twitter: twitter.trim() || void 0,
				telegram: telegram.trim() || void 0
			});
			await queryClient.invalidateQueries();
			toast.success(`${ticker} is live on Robinhood Chain`);
			navigate({
				to: "/token/$address",
				params: { address: onChain.token }
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Could not launch that coin";
			toast.error(msg);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "section-glow border-b border-border/60 bg-vault/70 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-12 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold sm:text-4xl",
						children: "Open a new coin"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-muted-foreground",
						children: "Every Bankpad coin pays its holders in a real national currency. Fill in the paperwork, and the vault handles the rest."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							title: "Token details",
							step: "01",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Token name",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: name,
											onChange: (e) => setName(e.target.value),
											placeholder: "Pepe Reserve",
											className: "glass-control"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Ticker",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: ticker,
											onChange: (e) => setTicker(e.target.value.toUpperCase().slice(0, 8)),
											placeholder: "PEPE",
											className: "glass-control num uppercase"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
									label: "Description",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										value: desc,
										onChange: (e) => setDesc(e.target.value.slice(0, 280)),
										placeholder: "Tell holders what this coin stands for.",
										rows: 4,
										className: "glass-control resize-none"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "num mt-1 text-right text-[11px] text-muted-foreground",
										children: [desc.length, "/280"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Logo",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "glass-control flex size-16 items-center justify-center rounded-xl border border-dashed text-3xl",
											children: logo
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-wrap gap-1.5",
												children: [
													"🏦",
													"🐸",
													"🐕",
													"🚀",
													"💷",
													"🦁",
													"🍣",
													"🥖"
												].map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setLogo(e),
													className: `size-9 rounded-lg border text-lg transition-colors ${logo === e ? "border-primary bg-primary/15" : "border-border bg-secondary/50"}`,
													children: e
												}, e))
											})
										})]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							title: "Reward currency",
							step: "02",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "-mt-2 mb-4 text-sm text-muted-foreground",
								children: "Pick the national currency your holders earn as rewards. Every trade routes a share of the fees back to holders, paid in this currency. Only launchable currencies have a live reward-token contract behind them."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
								children: CURRENCIES.map((cur) => {
									const live = isLaunchable(cur.code);
									const selected = pair === cur.code;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => live && setPair(cur.code),
										disabled: !live,
										className: `relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${selected ? "border-primary/60 bg-primary/10 shadow-[var(--shadow-vault)]" : live ? "glass-control border-border hover:-translate-y-0.5 hover:border-primary/40" : "glass-control border-border opacity-45"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xl",
												children: cur.flag
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "num block text-sm font-semibold",
													children: cur.code
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate text-[11px] text-muted-foreground",
													children: cur.name
												})]
											}),
											!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute right-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Soon"
											})
										]
									}, cur.code);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							title: "Links and creator tax",
							step: "03",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Website",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: website,
											onChange: (e) => setWebsite(e.target.value),
											placeholder: "https://",
											className: "glass-control"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Twitter",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: twitter,
											onChange: (e) => setTwitter(e.target.value),
											placeholder: "https://x.com/",
											className: "glass-control"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Telegram",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: telegram,
											onChange: (e) => setTelegram(e.target.value),
											placeholder: "https://t.me/",
											className: "glass-control"
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
								label: `Creator tax: ${tax.toFixed(1)}%`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									value: [tax],
									onValueChange: (v) => setTax(v[0] ?? 0),
									min: 0,
									max: 5,
									step: .5,
									className: "mt-3"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: [
										"Optional. Taken on each trade and paid to you in ",
										c.flag,
										" ",
										c.code,
										"."
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-soft rounded-2xl border p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-primary" }), " Fees"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-2 text-sm sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeeRow, {
										label: "Launch fee",
										value: launchFeeEth ? `${launchFeeEth} ETH` : "0.0005 ETH"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeeRow, {
										label: "Trading fee",
										value: `${(100 / 100).toFixed(1)}%`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeeRow, {
										label: "Split",
										value: `${60 / 10}0% creator / ${40 / 10}0% protocol`
									})
								]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:sticky lg:top-24 lg:self-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground",
							children: "Live preview"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel overflow-hidden rounded-2xl border p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-14 items-center justify-center rounded-xl bg-secondary text-3xl",
											children: logo
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-xs",
											children: c.flag
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-lg font-semibold",
											children: name || "Your token name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "num text-xs text-muted-foreground",
											children: [
												ticker || "TICKER",
												" · rewards in ",
												c.code,
												" ",
												c.symbol
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 min-h-[40px] text-sm text-muted-foreground",
									children: desc || "Your description shows up here for every trader who opens the coin."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1.5 flex justify-between text-[11px] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bonding curve" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num",
											children: "0%"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-1.5 w-full overflow-hidden rounded-full bg-secondary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-0 rounded-full bg-[image:var(--gradient-primary)]" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-lg bg-secondary/60 py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "mx-auto size-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-lg bg-secondary/60 py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Twitter, { className: "mx-auto size-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-lg bg-secondary/60 py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mx-auto size-3.5" })
										})
									]
								})
							]
						}),
						!isConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-soft mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: "Connect a wallet to launch"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Launching signs one transaction on Robinhood Chain. Use the Connect wallet button in the top right, or from any page."
							})] })]
						}) : !onRightChain ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: "Switch to Robinhood Chain"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs opacity-90",
								children: [
									"Bankpad only launches on chain ",
									robinhoodChain.id,
									". Click the network chip in your wallet to switch, or press Launch and we'll prompt you."
								]
							})] })]
						}) : !currencyLaunchable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-soft mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: "Pick a launchable reward currency"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [pair, " is on the roster but its reward-token contract isn't live yet. USD (USDG) is the first launchable currency. More arrive as their pools clear the depth floor."]
							})] })]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							disabled: busy || !formValid,
							onClick: handleLaunch,
							className: "mt-5 w-full bg-[image:var(--gradient-primary)] text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02]",
							children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Launching your coin"] }) : !isConnected ? "Connect wallet to launch" : !onRightChain ? "Switch and launch" : `Launch ${ticker || "token"} with ${c.code} rewards`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-center text-xs text-muted-foreground",
							children: [
								"Liquidity locks automatically at graduation. You keep ",
								tax.toFixed(1),
								"% creator tax plus your fee share.",
								" ",
								!isConnected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									search: { next: "/launch" },
									className: "text-primary hover:underline",
									children: "Learn more"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
function Panel({ title, step, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-panel rounded-2xl border p-5 transition-colors hover:border-primary/30 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num text-xs text-muted-foreground",
				children: step
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		className: "mb-2 block text-xs uppercase tracking-wide text-muted-foreground",
		children: label
	}), children] });
}
function FeeRow({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-secondary/60 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num text-sm font-semibold",
			children: value
		})]
	});
}
//#endregion
export { LaunchPage as component };
