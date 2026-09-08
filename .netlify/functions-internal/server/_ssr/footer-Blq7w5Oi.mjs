import { a as __toESM } from "../_runtime.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as TriangleAlert, l as Menu, n as Wallet, t as X } from "../_libs/lucide-react.mjs";
import { Y as defineChain, j as init__esm, lt as clsx, t as ConnectButton } from "../_libs/@rainbow-me/rainbowkit+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/footer-Blq7w5Oi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
init__esm();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
/** Robinhood Chain (mainnet).
*
* All Bankpad reads and writes target this chain. When a wallet is on a
* different network the UI prompts the user to switch here.
*/
var robinhoodChain = defineChain({
	id: 4663,
	name: "Robinhood Chain",
	nativeCurrency: {
		name: "Ether",
		symbol: "ETH",
		decimals: 18
	},
	rpcUrls: {
		default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
		public: { http: ["https://rpc.mainnet.chain.robinhood.com"] }
	},
	blockExplorers: { default: {
		name: "Blockscout",
		url: "https://robinhoodchain.blockscout.com"
	} },
	contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } }
});
/** The single wallet-connect entry point for the site.
*
* Uses RainbowKit's `ConnectButton.Custom` so it drops into the existing
* Bankpad button styles without inheriting RainbowKit's default chrome. It
* covers every state the header cares about:
*
*   - hydrating: loading skeleton so the button doesn't pop in
*   - disconnected: prompt to connect
*   - wrong chain: red "switch to Robinhood Chain" button
*   - connected + right chain: truncated address that opens the account modal
*/
function WalletButton({ full }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectButton.Custom, { children: ({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
		const ready = mounted;
		const connected = ready && account && chain;
		if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-9 ${full ? "w-full" : "w-32"} animate-pulse rounded-md bg-secondary/60` });
		if (!connected) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: openConnectModal,
			className: `${full ? "w-full" : ""} bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] hover:bg-primary`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "mr-2 size-4" }), "Connect wallet"]
		});
		if (chain.unsupported || chain.id !== robinhoodChain.id) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: openChainModal,
			variant: "outline",
			className: `${full ? "w-full" : ""} border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/20`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mr-2 size-4" }), "Switch to Robinhood Chain"]
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			className: `${full ? "w-full" : ""} border-primary/40 bg-primary/10 text-primary hover:bg-primary/20`,
			onClick: openAccountModal,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "mr-2 size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num max-w-[140px] truncate text-xs",
				children: account.displayName
			})]
		});
	} });
}
var bankpad_green_logo_jpg_asset_default = {
	version: 1,
	asset_id: "e3cccba2-2d63-4a36-9408-18f0f137b5b8",
	project_id: "5cb9bf57-bc77-41fe-8037-82faf9312f11",
	url: "/__l5e/assets-v1/e3cccba2-2d63-4a36-9408-18f0f137b5b8/bankpad-green-logo.jpg",
	r2_key: "a/v1/5cb9bf57-bc77-41fe-8037-82faf9312f11/e3cccba2-2d63-4a36-9408-18f0f137b5b8/bankpad-green-logo.jpg",
	original_filename: "bankpad-green-logo.jpg",
	size: 12961,
	content_type: "image/jpeg",
	created_at: "2026-09-06T20:41:18Z"
};
var NAV = [
	{
		to: "/launch",
		label: "Launch"
	},
	{
		to: "/explore",
		label: "Explore"
	},
	{
		to: "/dashboard",
		label: "Dashboard"
	}
];
function Navbar() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-50 border-b border-border/70 bg-background/45 shadow-[inset_0_-1px_0_oklch(1_0_0/6%),0_12px_40px_-28px_oklch(0.02_0.02_264/85%)] backdrop-blur-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: bankpad_green_logo_jpg_asset_default.url,
						alt: "Bankpad",
						className: "h-10 w-auto max-w-[190px] object-contain sm:max-w-[220px]"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1 hidden rounded-full border border-border bg-card/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:inline",
						children: "Robinhood Chain"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-1 md:flex",
					children: NAV.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						activeProps: { className: "bg-secondary text-foreground" },
						inactiveProps: { className: "text-muted-foreground" },
						className: "rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-secondary/60 hover:text-foreground",
						children: n.label
					}, n.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletButton, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "text-muted-foreground md:hidden",
						onClick: () => setOpen((o) => !o),
						"aria-label": "Toggle menu",
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					})]
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "glass-panel border-t border-border/60 px-4 py-4 md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1",
				children: [NAV.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: n.to,
					onClick: () => setOpen(false),
					className: "rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
					children: n.label
				}, n.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletButton, { full: true })
				})]
			})
		})]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-border/60 bg-background/40 backdrop-blur-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: bankpad_green_logo_jpg_asset_default.url,
						alt: "Bankpad",
						className: "h-10 w-auto max-w-[220px] object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-sm text-sm text-muted-foreground",
						children: "The launchpad where every coin is paired with a real country currency. Built on Robinhood Chain."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "Product"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/launch",
							className: "hover:text-foreground",
							children: "Launch a token"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/explore",
							className: "hover:text-foreground",
							children: "Explore launches"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							className: "hover:text-foreground",
							children: "Creator dashboard"
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "Currencies"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "USD, EUR, GBP, JPY, CAD, AUD, INR, CHF, BRL, KRW, MXN, NGN"
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border/60 py-5 text-center text-xs text-muted-foreground",
			children: "Bankpad is a demo interface. Nothing here is financial advice."
		})]
	});
}
//#endregion
export { robinhoodChain as a, cn as i, Footer as n, Navbar as r, Button as t };
