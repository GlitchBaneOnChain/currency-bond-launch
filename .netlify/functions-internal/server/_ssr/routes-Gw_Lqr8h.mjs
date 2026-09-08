import { h as Link, v as ClientOnly } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as compact, s as toTokenView, t as CURRENCIES } from "./market-qqUb7Jkc.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as ArrowRight, a as TrendingUp, f as Landmark, h as Coins, u as Lock } from "../_libs/lucide-react.mjs";
import { n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { n as Footer, r as Navbar, t as Button } from "./footer-Blq7w5Oi.mjs";
import { t as TokenCard } from "./token-card-DCvShcfk.mjs";
import { t as homeQuery } from "./routes-dygQ_vq_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Gw_Lqr8h.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { data } = useSuspenseQuery(homeQuery);
	const trending = [...(data?.tokens ?? []).map(toTokenView)].sort((a, b) => b.volume24h - a.volume24h).slice(0, 6);
	const stats = data?.stats ?? {
		launches: 0,
		volume: 0,
		fees: 0,
		pairsUsed: 0
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden border-b border-border/60 bg-background/45 py-2 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "animate-ticker flex w-max gap-8 whitespace-nowrap px-4",
					children: [...CURRENCIES, ...CURRENCIES].map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "num text-xs text-muted-foreground",
						children: [
							c.flag,
							" ",
							c.code,
							" ",
							c.symbol,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-success",
								children: "open"
							})
						]
					}, i))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "vault-surface section-glow relative overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-ledger absolute inset-0 opacity-60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex flex-col items-center pt-6 pb-14 md:pt-10 md:pb-20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none relative h-[340px] w-full sm:h-[420px] md:h-[500px] lg:h-[560px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "animate-rise mx-auto mt-8 max-w-3xl px-4 text-center sm:px-6 md:mt-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "glass-soft inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-3.5 text-primary" }), " Now open on Robinhood Chain"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl",
								children: ["Launch coins that reward holders in ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "brand-text",
									children: "real country currencies"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg",
								children: "Bankpad is a launchpad built like a bank. Pick a national currency, mint your coin, and every trade pays your holders rewards in that currency."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-4 max-w-md text-sm text-primary/90",
								children: "Spin the globe, point to a country, then click it to launch a coin that rewards holders in its currency."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									className: "w-full bg-[image:var(--gradient-primary)] text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:-translate-y-0.5 hover:scale-[1.02] sm:w-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/launch",
										children: ["Launch Token ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 size-4" })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									variant: "outline",
									className: "glass-control w-full border-border text-base transition-all hover:-translate-y-0.5 hover:border-primary/40 sm:w-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/explore",
										children: "Explore launches"
									})
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b border-border/60 bg-background/45 px-4 py-6 backdrop-blur-xl sm:px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel mx-auto grid max-w-4xl grid-cols-2 divide-border overflow-hidden rounded-2xl border md:grid-cols-4 md:divide-x",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCell, {
							label: "Total launches",
							value: stats.launches.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCell, {
							label: "Volume traded",
							value: compact(stats.volume)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCell, {
							label: "Fees earned by creators",
							value: compact(stats.fees),
							accent: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCell, {
							label: "Currencies supported",
							value: String(CURRENCIES.length)
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "section-glow mx-auto max-w-7xl px-4 py-20 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-center text-3xl font-bold sm:text-4xl",
						children: "How Bankpad works"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-xl text-center text-muted-foreground",
						children: "Three steps from an idea to a coin that pays its holders in the currency you choose."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-12 grid gap-5 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-5" }),
								step: "01",
								title: "Pick a reward currency and mint",
								body: "Name your coin, choose the national currency your holders earn, set an optional creator tax, and open the curve."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-5" }),
								step: "02",
								title: "Holders earn on every trade",
								body: "Each buy and sell routes a share of the fees back to holders, paid in your chosen national currency."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-5" }),
								step: "03",
								title: "Graduate to a locked pool",
								body: "At full curve, liquidity locks into a Uniswap V4 pool. Nobody can pull it. Rewards keep flowing."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-y border-border/60 bg-vault/70 py-14 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-center text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground",
						children: "Reward currencies your holders can earn"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 flex flex-wrap justify-center gap-3",
						children: CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-soft flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg",
									children: c.flag
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num text-sm font-semibold",
									children: c.code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: c.symbol
								})
							]
						}, c.code))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-4 py-20 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl font-bold",
						children: trending.length > 0 ? "Trending launches" : "Latest launches"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted-foreground",
						children: trending.length > 0 ? "The most traded coins on Bankpad right now." : "Nothing has launched yet. The first coin here could be yours."
					})] }), trending.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/explore",
						className: "hidden text-sm font-medium text-primary hover:underline sm:block",
						children: "View all"
					})]
				}), trending.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-soft mt-8 rounded-2xl border border-dashed p-12 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold",
							children: "Be the first launch on Bankpad"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground",
							children: "Pick a country currency, mint your coin and open its curve to traders in under a minute."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-6 bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/launch",
								children: "Launch the first coin"
							})
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: trending.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenCard, { token: t }, t.address))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-7xl px-4 pb-20 sm:px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel section-glow relative overflow-hidden rounded-3xl border p-10 text-center md:p-16",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-ledger absolute inset-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-3xl font-bold sm:text-4xl",
								children: "Open your branch on Bankpad"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-3 max-w-lg text-muted-foreground",
								children: "Launch in under a minute. Pay your holders rewards in the currency their community actually uses, and keep a creator cut on every trade."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								className: "mt-8 bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground transition-transform hover:scale-[1.03]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/launch",
									children: ["Launch Token ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 size-4" })]
								})
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
function StatCell({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-6 py-5 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `num text-2xl font-bold ${accent ? "brand-text" : ""}`,
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs uppercase tracking-wide text-muted-foreground",
			children: label
		})]
	});
}
function Step({ icon, step, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-panel glass-interactive rounded-2xl border p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary",
					children: icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "num text-xs text-muted-foreground",
					children: step
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-5 text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted-foreground",
				children: body
			})
		]
	});
}
//#endregion
export { Home as component };
