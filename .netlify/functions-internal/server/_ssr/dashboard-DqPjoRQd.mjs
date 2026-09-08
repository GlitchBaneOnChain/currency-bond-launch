import { a as __toESM } from "../_runtime.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as exactMoney, c as tokenPrice, i as currency, r as compact, s as toTokenView } from "./market-qqUb7Jkc.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as Plus, d as LoaderCircle, g as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { a as useQuery, l as useQueryClient } from "../_libs/@rainbow-me/rainbowkit+[...].mjs";
import { n as Footer, r as Navbar, t as Button } from "./footer-Blq7w5Oi.mjs";
import { a as useServerFn, t as claimFees } from "./account.functions-kabeejl8.mjs";
import { n as useAuth, t as useAccount } from "./useAuth-1OLzi8Vv.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as listTokens } from "./market.functions-BKizqEmI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DqPjoRQd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { user, loading } = useAuth();
	const { data: account, isLoading } = useAccount();
	const { data: market } = useQuery({
		queryKey: ["tokens"],
		queryFn: () => listTokens()
	});
	const myTokens = (account?.myTokens ?? []).map(toTokenView);
	const allTokens = (market?.tokens ?? []).map(toTokenView);
	const positions = (account?.holdings ?? []).map((h) => ({
		holding: h,
		token: allTokens.find((t) => t.id === h.tokenId)
	})).filter((p) => Boolean(p.token));
	const totalVolume = myTokens.reduce((s, t) => s + t.volume24h, 0);
	const totalHolders = myTokens.reduce((s, t) => s + t.holders, 0);
	const totalFees = myTokens.reduce((s, t) => s + t.feesAccrued + t.feesClaimed, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "section-glow border-b border-border/60 bg-vault/70 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-12 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold sm:text-4xl",
						children: "Your dashboard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: user ? account?.displayName ?? "Signed in" : "Connect your wallet to see your launches and positions"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "bg-primary font-semibold text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/launch",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " New launch"]
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-7xl px-4 py-10 sm:px-6",
				children: !user && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-soft rounded-2xl border border-dashed p-12 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold",
							children: "Connect your wallet to open your dashboard"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground",
							children: "Your launches, balances, positions and creator fees all live here."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-6 bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								search: { next: "/dashboard" },
								children: "Connect wallet"
							})
						})
					]
				}) : isLoading || loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center py-20 text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Coins launched",
								value: String(myTokens.length)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Volume 24h",
								value: compact(totalVolume)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Holders reached",
								value: compact(totalHolders)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Creator fees earned",
								value: compact(totalFees),
								accent: true
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-12 text-xl font-semibold",
						children: "Your balances"
					}),
					(account?.balances ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "glass-soft mt-4 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground",
						children: "No balance yet. Your first trade opens a test balance of 10,000 in that currency."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4",
						children: (account?.balances ?? []).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel rounded-xl border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs uppercase tracking-wide text-muted-foreground",
								children: [
									currency(b.currency).flag,
									" ",
									b.currency
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "num mt-1 text-lg font-semibold",
								children: exactMoney(b.amount, b.currency)
							})]
						}, b.currency))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-12 text-xl font-semibold",
						children: "Your positions"
					}),
					positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-soft mt-4 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground",
						children: [
							"You do not hold any coins yet.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/explore",
								className: "text-primary hover:underline",
								children: "Explore launches"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: positions.map(({ holding, token }) => {
							const c = currency(token.pair);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/token/$address",
								params: { address: token.address },
								className: "glass-panel flex items-center gap-4 rounded-2xl border p-4 transition-all hover:border-primary/35",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-11 items-center justify-center rounded-lg bg-secondary text-xl",
										children: token.emoji
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate font-semibold",
											children: token.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "num text-xs text-muted-foreground",
											children: [
												compact(holding.amount),
												" ",
												token.ticker
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "num text-sm font-semibold",
										children: [c.symbol, tokenPrice(holding.amount * token.price)]
									})
								]
							}, holding.tokenId);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-12 text-xl font-semibold",
						children: "Your launches"
					}),
					myTokens.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-soft mt-4 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground",
						children: [
							"You have not launched a coin yet.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/launch",
								className: "text-primary hover:underline",
								children: "Launch your first one"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-4",
						children: myTokens.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LaunchRow, { token: t }, t.address))
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
function Kpi({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-panel glass-interactive rounded-2xl border p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `num mt-2 text-2xl font-bold ${accent ? "brand-text" : ""}`,
			children: value
		})]
	});
}
function LaunchRow({ token }) {
	const c = currency(token.pair);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const claim = useServerFn(claimFees);
	const queryClient = useQueryClient();
	async function onClaim(e) {
		e.preventDefault();
		setBusy(true);
		try {
			const res = await claim({ data: { tokenId: token.id } });
			await queryClient.invalidateQueries();
			toast.success(`Claimed ${exactMoney(res.claimed, token.pair)}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not claim fees");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-panel flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition-all hover:border-primary/35 hover:shadow-[var(--shadow-glow)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-12 items-center justify-center rounded-lg bg-secondary text-2xl",
					children: token.emoji
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-xs",
					children: c.flag
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-[140px] flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: token.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "num text-xs text-muted-foreground",
					children: [
						token.ticker,
						" · rewards in ",
						c.code,
						" ·",
						" ",
						token.graduated ? "Graduated" : `${token.progress.toFixed(1)}% on curve`
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden gap-6 sm:flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
					label: "Volume 24h",
					value: `${c.symbol}${compact(token.volume24h)}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
					label: "Holders",
					value: compact(token.holders)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-wide text-muted-foreground",
							children: "Claimable"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "num text-sm font-semibold text-primary",
							children: exactMoney(token.feesAccrued, token.pair)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: busy || token.feesAccrued <= 0,
						onClick: onClaim,
						className: "bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground",
						children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Claim"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/token/$address",
						params: { address: token.address },
						className: "text-muted-foreground hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })
					})
				]
			})
		]
	});
}
function Mini({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] uppercase tracking-wide text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "num text-sm font-semibold",
		children: value
	})] });
}
//#endregion
export { Dashboard as component };
