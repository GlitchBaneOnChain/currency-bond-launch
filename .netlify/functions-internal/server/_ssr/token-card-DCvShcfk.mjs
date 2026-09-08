import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as tokenPrice, i as currency, o as timeAgo, r as compact } from "./market-qqUb7Jkc.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/token-card-DCvShcfk.js
var import_jsx_runtime = require_jsx_runtime();
function TokenCard({ token }) {
	const c = currency(token.pair);
	const up = token.change24h >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/token/$address",
		params: { address: token.address },
		className: "glass-panel glass-interactive group relative flex flex-col overflow-hidden rounded-xl border p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "glass-soft flex size-12 items-center justify-center rounded-lg border text-2xl transition-transform duration-300 group-hover:scale-105",
							children: token.emoji
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-xs",
							children: c.flag
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-semibold",
								children: token.name
							}), token.graduated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary",
								children: "Graduated"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "num text-xs text-muted-foreground",
							children: [
								token.ticker,
								" · rewards in ",
								c.code,
								" · ",
								timeAgo(token.createdAt)
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `num text-sm font-semibold ${up ? "text-success" : "text-destructive"}`,
						children: [
							up ? "+" : "",
							token.change24h.toFixed(1),
							"%"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 line-clamp-2 text-sm text-muted-foreground",
				children: token.description || "No description yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-3 gap-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Price",
						value: `${c.symbol}${tokenPrice(token.price)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Volume 24h",
						value: `${c.symbol}${compact(token.volume24h)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Holders",
						value: compact(token.holders)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: token.graduated ? "Locked pool" : "Bonding curve" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "num",
						children: [token.progress.toFixed(1), "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1.5 w-full overflow-hidden rounded-full bg-secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-700",
						style: { width: `${token.progress}%` }
					})
				})]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-control rounded-lg border px-2 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num truncate text-xs font-semibold",
			children: value
		})]
	});
}
//#endregion
export { TokenCard as t };
