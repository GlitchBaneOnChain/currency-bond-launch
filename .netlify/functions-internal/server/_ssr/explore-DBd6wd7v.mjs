import { a as __toESM } from "../_runtime.mjs";
import { s as toTokenView, t as CURRENCIES } from "./market-qqUb7Jkc.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as Search } from "../_libs/lucide-react.mjs";
import { n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { n as Footer, r as Navbar } from "./footer-Blq7w5Oi.mjs";
import { t as Input } from "./input-DXH4McFR.mjs";
import { n as exploreQuery, t as Route } from "./explore-DXdicJpH.mjs";
import { t as TokenCard } from "./token-card-DCvShcfk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-DBd6wd7v.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Explore() {
	const { data } = useSuspenseQuery(exploreQuery);
	const all = (0, import_react.useMemo)(() => data.tokens.map(toTokenView), [data]);
	const [q, setQ] = (0, import_react.useState)("");
	const search = Route.useSearch();
	const [pair, setPair] = (0, import_react.useState)(search.currency ?? "ALL");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("newest");
	const list = (0, import_react.useMemo)(() => {
		let out = all.filter((t) => {
			if (pair !== "ALL" && t.pair !== pair) return false;
			if (status === "graduated" && !t.graduated) return false;
			if (status === "curve" && t.graduated) return false;
			if (q && !`${t.name} ${t.ticker}`.toLowerCase().includes(q.toLowerCase())) return false;
			return true;
		});
		out = [...out].sort((a, b) => {
			if (sort === "volume") return b.volume24h - a.volume24h;
			if (sort === "marketcap") return b.marketCap - a.marketCap;
			if (sort === "progress") return b.progress - a.progress;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
		return out;
	}, [
		all,
		q,
		pair,
		status,
		sort
	]);
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
						children: "Explore all launches"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted-foreground",
						children: all.length === 0 ? `No coins yet. ${CURRENCIES.length} national currencies are ready for the first launch.` : `${all.length} ${all.length === 1 ? "coin" : "coins"} across ${CURRENCIES.length} national currencies.`
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel rounded-2xl border p-4 shadow-[var(--shadow-glow)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Search by name or ticker",
								className: "glass-control border-input pl-9"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								active: pair === "ALL",
								onClick: () => setPair("ALL"),
								children: "All currencies"
							}), CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
								active: pair === c.code,
								onClick: () => setPair(c.code),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mr-1",
									children: c.flag
								}), c.code]
							}, c.code))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4",
							children: [
								[
									["all", "All"],
									["curve", "On curve"],
									["graduated", "Graduated"]
								].map(([k, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									active: status === k,
									onClick: () => setStatus(k),
									children: label
								}, k)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-2 hidden h-5 w-px bg-border sm:block" }),
								[
									["newest", "Newest"],
									["volume", "Volume"],
									["marketcap", "Market cap"],
									["progress", "Progress"]
								].map(([k, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									active: sort === k,
									onClick: () => setSort(k),
									children: label
								}, k))
							]
						})
					]
				}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-soft mt-10 rounded-2xl border border-dashed py-20 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: all.length === 0 ? "No coins have launched yet" : "No launches match those filters"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: all.length === 0 ? "Head to the launch page to mint the very first Bankpad coin." : "Try a different currency or clear the search."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: list.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenCard, { token: t }, t.address))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
function Chip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: `rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 ${active ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`,
		children
	});
}
//#endregion
export { Explore as component };
