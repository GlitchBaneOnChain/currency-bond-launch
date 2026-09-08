import { a as __toESM } from "../_runtime.mjs";
import { g as useNavigate, h as Link, v as ClientOnly } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as exactMoney, c as tokenPrice, i as currency, o as timeAgo, r as compact, s as toTokenView } from "./market-qqUb7Jkc.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as LoaderCircle, m as Globe, o as Send, r as Twitter, u as Lock } from "../_libs/lucide-react.mjs";
import { l as useQueryClient } from "../_libs/@rainbow-me/rainbowkit+[...].mjs";
import { n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { n as Footer, r as Navbar, t as Button } from "./footer-Blq7w5Oi.mjs";
import { t as Input } from "./input-DXH4McFR.mjs";
import { a as useServerFn, i as tradeToken, t as claimFees } from "./account.functions-kabeejl8.mjs";
import { n as useAuth, t as useAccount } from "./useAuth-1OLzi8Vv.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as tokenQuery, t as Route } from "./token._address-CQ7YV6QL.mjs";
import { a as ResponsiveContainer, i as Area, n as YAxis, o as Tooltip, r as XAxis, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/token._address-c_nrcBE6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TokenPage() {
	const { address } = Route.useParams();
	const { data } = useSuspenseQuery(tokenQuery(address));
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data: account } = useAccount();
	const trade = useServerFn(tradeToken);
	const claimFn = useServerFn(claimFees);
	const [side, setSide] = (0, import_react.useState)("buy");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [claiming, setClaiming] = (0, import_react.useState)(false);
	const token = toTokenView(data.token);
	const c = currency(token.pair);
	const up = token.change24h >= 0;
	const series = (0, import_react.useMemo)(() => {
		const points = [...data.trades].reverse().map((t, i) => ({
			t: i,
			p: Number(t.price)
		}));
		if (points.length === 0) return [{
			t: 0,
			p: token.price
		}];
		return [...points, {
			t: points.length,
			p: token.price
		}];
	}, [data.trades, token.price]);
	const balance = account?.balances.find((b) => b.currency === token.pair)?.amount ?? 0;
	const holding = account?.holdings.find((h) => h.tokenId === token.id)?.amount ?? 0;
	const isCreator = user?.id === token.creatorId;
	const feePct = (100 + token.creatorTaxBps) / 100;
	async function submitTrade() {
		if (!user) {
			navigate({
				to: "/auth",
				search: { next: `/token/${token.address}` }
			});
			return;
		}
		const value = Number(amount);
		if (!(value > 0)) {
			toast.error("Enter an amount greater than zero");
			return;
		}
		setBusy(true);
		try {
			await trade({ data: {
				tokenId: token.id,
				side,
				amount: value
			} });
			await queryClient.invalidateQueries();
			setAmount("");
			toast.success(side === "buy" ? `Bought ${token.ticker}` : `Sold ${token.ticker}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "That trade did not go through");
		} finally {
			setBusy(false);
		}
	}
	async function onClaim() {
		setClaiming(true);
		try {
			const res = await claimFn({ data: { tokenId: token.id } });
			await queryClient.invalidateQueries();
			toast.success(`Claimed ${exactMoney(res.claimed, token.pair)}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not claim fees");
		} finally {
			setClaiming(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "section-glow border-b border-border/60 bg-vault/70 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-4 py-8 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-16 items-center justify-center rounded-2xl bg-secondary text-4xl",
								children: token.emoji
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-background text-sm",
								children: c.flag
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-[200px] flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "text-2xl font-bold sm:text-3xl",
										children: token.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "num rounded-md bg-secondary px-2 py-0.5 text-xs",
										children: [
											token.ticker,
											" · rewards in ",
											c.code
										]
									}),
									token.graduated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3" }), " Graduated"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary",
										children: "On curve"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "num mt-1 text-xs text-muted-foreground",
								children: token.address
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "num text-2xl font-bold",
								children: [c.symbol, tokenPrice(token.price)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: `num text-sm ${up ? "text-success" : "text-destructive"}`,
								children: [
									up ? "+" : "",
									token.change24h.toFixed(1),
									"% 24h"
								]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.6fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel overflow-hidden rounded-2xl border p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-4 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-semibold",
										children: "Price history"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "num text-xs text-muted-foreground",
										children: [
											data.trades.length,
											" ",
											data.trades.length === 1 ? "trade" : "trades"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-64",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
										width: "100%",
										height: "100%",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
											data: series,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
													id: "fill",
													x1: "0",
													y1: "0",
													x2: "0",
													y2: "1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
														offset: "0%",
														stopColor: "var(--color-primary)",
														stopOpacity: .5
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
														offset: "100%",
														stopColor: "var(--color-primary)",
														stopOpacity: 0
													})]
												}) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
													dataKey: "t",
													hide: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
													domain: ["dataMin", "dataMax"],
													hide: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
													contentStyle: {
														background: "var(--color-popover)",
														border: "1px solid var(--color-border)",
														borderRadius: 10,
														fontSize: 12
													},
													labelFormatter: () => "",
													formatter: (v) => [`${c.symbol}${tokenPrice(v)}`, "Price"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
													type: "monotone",
													dataKey: "p",
													stroke: "var(--color-primary)",
													strokeWidth: 2,
													fill: "url(#fill)"
												})
											]
										})
									})
								}),
								data.trades.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-center text-xs text-muted-foreground",
									children: "No trades yet. The first buy sets the opening move."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel rounded-2xl border p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-semibold",
										children: token.graduated ? "Locked pool" : "Graduation progress"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "num text-sm text-primary",
										children: [token.progress.toFixed(1), "%"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-700",
										style: { width: `${token.progress}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: token.graduated ? `Liquidity is locked in the ${token.ticker} / ${c.code} pool.` : `When the curve fills, liquidity locks into the ${token.ticker} / ${c.code} pool.`
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Market cap",
									value: `${c.symbol}${compact(token.marketCap)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Volume 24h",
									value: `${c.symbol}${compact(token.volume24h)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Reserve",
									value: `${c.symbol}${compact(token.reserve)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Holders",
									value: compact(token.holders)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel rounded-2xl border p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "font-semibold",
									children: ["About ", token.name]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted-foreground",
									children: token.description || "The creator has not added a description yet."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Social, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-3.5" }),
											label: "Website",
											href: token.website
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Social, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Twitter, { className: "size-3.5" }),
											label: "Twitter",
											href: token.twitter
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Social, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }),
											label: "Telegram",
											href: token.telegram
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 text-xs text-muted-foreground",
									children: [
										"Created by ",
										token.creatorName,
										" · ",
										timeAgo(token.createdAt)
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel rounded-2xl border p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-semibold",
								children: "Recent trades"
							}), data.trades.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Nothing has traded yet."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 divide-y divide-border/60",
								children: data.trades.slice(0, 15).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between py-2 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `font-semibold capitalize ${t.side === "buy" ? "text-success" : "text-destructive"}`,
											children: t.side
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num text-muted-foreground",
											children: [
												compact(Number(t.token_amount)),
												" ",
												token.ticker
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num",
											children: [c.symbol, Number(t.currency_amount).toLocaleString(void 0, { maximumFractionDigits: 2 })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num text-xs text-muted-foreground",
											children: timeAgo(t.created_at)
										})
									]
								}, t.id))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 lg:sticky lg:top-24 lg:self-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel rounded-2xl border p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-1 rounded-xl bg-secondary/60 p-1",
									children: ["buy", "sell"].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setSide(s),
										className: `rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${side === s ? s === "buy" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive" : "text-muted-foreground"}`,
										children: s
									}, s))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-2 flex justify-between text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Amount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num",
												children: side === "buy" ? `Balance ${exactMoney(balance, token.pair)}` : `Holding ${compact(holding)} ${token.ticker}`
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "glass-control flex items-center gap-2 rounded-xl border border-border px-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-lg",
													children: side === "buy" ? c.flag : token.emoji
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: amount,
													onChange: (e) => setAmount(e.target.value.replace(/[^0-9.]/g, "")),
													placeholder: "0.00",
													className: "num border-0 bg-transparent px-0 text-lg shadow-none focus-visible:ring-0"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "num text-sm text-muted-foreground",
													children: side === "buy" ? c.code : token.ticker
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex gap-2",
											children: (side === "buy" ? [
												"25",
												"100",
												"500",
												"Max"
											] : [
												"25%",
												"50%",
												"100%"
											]).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													if (side === "buy") setAmount(p === "Max" ? String(balance) : p);
													else {
														const pct = Number(p.replace("%", "")) / 100;
														setAmount(String(holding * pct));
													}
												},
												className: "glass-control num flex-1 rounded-lg border border-border py-1.5 text-xs text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground",
												children: p
											}, p))
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 space-y-1.5 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Estimated",
											value: side === "buy" ? `~${compact(token.price > 0 ? (Number(amount) || 0) / token.price : 0)} ${token.ticker}` : `~${c.symbol}${tokenPrice((Number(amount) || 0) * token.price)}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Trading fee",
											value: `${feePct.toFixed(1)}%`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Creator tax",
											value: `${(token.creatorTaxBps / 100).toFixed(1)}%`
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "lg",
									disabled: busy,
									onClick: submitTrade,
									className: `mt-4 w-full font-semibold ${side === "buy" ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "bg-destructive text-destructive-foreground"}`,
									children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Confirming"] }) : !user ? "Connect wallet to trade" : `${side === "buy" ? "Buy" : "Sell"} ${token.ticker}`
								}),
								!user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-center text-xs text-muted-foreground",
									children: "New accounts start with a test balance of 10,000 in each currency they trade."
								})
							]
						}),
						isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel rounded-2xl border border-primary/30 p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-semibold",
									children: "Your creator fees"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [
										"Paid in ",
										c.flag,
										" ",
										c.code,
										" as people trade."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "num mt-4 text-2xl font-bold brand-text",
									children: exactMoney(token.feesAccrued, token.pair)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									disabled: claiming || token.feesAccrued <= 0,
									onClick: onClaim,
									variant: "outline",
									className: "mt-4 w-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/20",
									children: claiming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Claim fees"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "num mt-2 text-center text-[11px] text-muted-foreground",
									children: [exactMoney(token.feesClaimed, token.pair), " claimed so far"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/explore",
							className: "block text-center text-sm text-primary hover:underline",
							children: "Back to all launches"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-panel glass-interactive rounded-2xl border p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num mt-1 text-lg font-semibold",
			children: value
		})]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "num text-foreground",
			children: value
		})]
	});
}
function Social({ icon, label, href }) {
	if (!href) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
		children: [
			icon,
			" ",
			label
		]
	});
}
//#endregion
export { TokenPage as component };
