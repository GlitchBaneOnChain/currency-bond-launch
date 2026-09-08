import { a as __toESM } from "../_runtime.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as supabase } from "./client-WRWtFchz.mjs";
import { t as createSsrRpc } from "./createSsrRpc-gZoXj-5I.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Route } from "./auth-DcTOvV32.mjs";
import { d as LoaderCircle, n as Wallet } from "../_libs/lucide-react.mjs";
import { n as Footer, r as Navbar, t as Button } from "./footer-Blq7w5Oi.mjs";
import { t as Input } from "./input-DXH4McFR.mjs";
import { t as Label } from "./label--w-LKdRz.mjs";
import { n as useAuth } from "./useAuth-1OLzi8Vv.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-a8IHFOmG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function normalize(address) {
	if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("That does not look like a wallet address");
	return address.toLowerCase();
}
var requestWalletNonce = createServerFn({ method: "POST" }).inputValidator((data) => ({ address: normalize(data.address) })).handler(createSsrRpc("39e12e24bf91dfe527cf527c95de1d7d2471184e691e4edcd465af9299d510cf"));
var verifyWallet = createServerFn({ method: "POST" }).inputValidator((data) => ({
	address: normalize(data.address),
	signature: data.signature
})).handler(createSsrRpc("542a8d93aa18e20b9a1ca18b0ec5942cf41bd4d9b725713c4596b9b214ae05e5"));
function getInjectedWallet() {
	if (typeof window === "undefined") return null;
	return window.ethereum ?? null;
}
/** Connects a browser wallet, proves ownership with a signature and opens a Bankpad session. */
async function signInWithWallet() {
	const wallet = getInjectedWallet();
	if (!wallet) throw new Error("No wallet found. Install MetaMask or another browser wallet, then try again.");
	const address = (await wallet.request({ method: "eth_requestAccounts" }))?.[0];
	if (!address) throw new Error("No wallet account was shared");
	const { message } = await requestWalletNonce({ data: { address } });
	const { tokenHash, displayName } = await verifyWallet({ data: {
		address,
		signature: await wallet.request({
			method: "personal_sign",
			params: [message, address]
		})
	} });
	const { error } = await supabase.auth.verifyOtp({
		type: "email",
		token_hash: tokenHash
	});
	if (error) throw new Error(error.message);
	return { displayName };
}
function safeNext(next) {
	return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}
function AuthPage() {
	const { next } = Route.useSearch();
	const navigate = useNavigate();
	const { user, loading } = useAuth();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [checkEmail, setCheckEmail] = (0, import_react.useState)(false);
	const [walletBusy, setWalletBusy] = (0, import_react.useState)(false);
	async function connectWallet() {
		setWalletBusy(true);
		try {
			const { displayName } = await signInWithWallet();
			toast.success(`Connected as ${displayName}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not connect that wallet");
		} finally {
			setWalletBusy(false);
		}
	}
	(0, import_react.useEffect)(() => {
		if (!loading && user) navigate({
			to: safeNext(next),
			replace: true
		});
	}, [
		user,
		loading,
		next,
		navigate
	]);
	async function submit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			if (mode === "signup") {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: { display_name: name || email.split("@")[0] },
						emailRedirectTo: `${window.location.origin}${safeNext(next)}`
					}
				});
				if (error) throw error;
				if (!data.session) {
					setCheckEmail(true);
					toast.success("Account created. Confirm your email to finish.");
				} else toast.success("Account created. You are signed in.");
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				toast.success("Welcome back");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setBusy(false);
		}
	}
	async function google() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${window.location.origin}${safeNext(next)}` }
		});
		if (error) toast.error("Google sign in failed. Try again.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6",
				children: [checkEmail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel rounded-2xl border p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold",
							children: "Confirm your email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: [
								"We sent a confirmation link to ",
								email,
								". Open it, then come back and sign in to launch and trade."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-6 w-full bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground",
							onClick: () => {
								setCheckEmail(false);
								setMode("signin");
							},
							children: "Back to sign in"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel rounded-2xl border p-6 sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold",
							children: "Connect to Bankpad"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Connect your wallet to launch coins, trade the curve and claim your creator fees."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							disabled: walletBusy,
							onClick: connectWallet,
							className: "mt-6 w-full bg-[image:var(--gradient-primary)] text-base font-semibold text-primary-foreground",
							children: [walletBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "mr-2 size-4" }), "Connect wallet"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-center text-[11px] text-muted-foreground",
							children: "Works with MetaMask, Rabby, Coinbase Wallet and other browser wallets. You sign a free message, nothing moves."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
								" or use email ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "glass-control w-full",
							onClick: google,
							children: "Continue with Google"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-5 h-px bg-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: submit,
							className: "space-y-4",
							children: [
								mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-2 block text-xs uppercase tracking-wide text-muted-foreground",
									children: "Display name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: name,
									onChange: (e) => setName(e.target.value),
									placeholder: "Your name",
									className: "glass-control"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-2 block text-xs uppercase tracking-wide text-muted-foreground",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									required: true,
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: "you@email.com",
									className: "glass-control"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-2 block text-xs uppercase tracking-wide text-muted-foreground",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									required: true,
									minLength: 6,
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "At least 6 characters",
									className: "glass-control"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									disabled: busy,
									className: "w-full bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground",
									children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), mode === "signin" ? "Sign in" : "Create account"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-5 text-center text-sm text-muted-foreground",
							children: [
								mode === "signin" ? "New to Bankpad?" : "Already have an account?",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "font-medium text-primary hover:underline",
									onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
									children: mode === "signin" ? "Create an account" : "Sign in"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					className: "mt-6 text-center text-sm text-muted-foreground hover:text-foreground",
					children: "Browse launches without an account"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { AuthPage as component };
