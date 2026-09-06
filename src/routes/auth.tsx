import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { useAuth } from "@/hooks/useAuth";
import { signInWithWallet } from "@/lib/wallet-client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Bankpad" },
      {
        name: "description",
        content:
          "Create your Bankpad account to launch a coin paired with a country currency, trade the bonding curve and claim creator fees.",
      },
      { property: "og:title", content: "Sign in to Bankpad" },
      { property: "og:description", content: "Create an account to launch and trade currency paired coins." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { next?: string } =>
    typeof search['next'] === "string" ? { next: search['next'] as string } : {},
  component: AuthPage,
});

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);

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

  useEffect(() => {
    if (!loading && user) navigate({ to: safeNext(next), replace: true });
  }, [user, loading, next, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}${safeNext(next)}`,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          toast.success("Account created. Confirm your email to finish.");
        } else {
          toast.success("Account created. You are signed in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
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
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: safeNext(next), replace: true });
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        {checkEmail ? (
          <div className="glass-panel rounded-2xl border p-8 text-center">
            <h1 className="text-2xl font-bold">Confirm your email</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a confirmation link to {email}. Open it, then come back and sign in to launch and trade.
            </p>
            <Button
              className="mt-6 w-full bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground"
              onClick={() => {
                setCheckEmail(false);
                setMode("signin");
              }}
            >
              Back to sign in
            </Button>
          </div>
        ) : (
        <div className="glass-panel rounded-2xl border p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Connect to Bankpad</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your wallet to launch coins, trade the curve and claim your creator fees.
          </p>

          <Button
            type="button"
            disabled={walletBusy}
            onClick={connectWallet}
            className="mt-6 w-full bg-[image:var(--gradient-primary)] text-base font-semibold text-primary-foreground"
          >
            {walletBusy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Wallet className="mr-2 size-4" />}
            Connect wallet
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Works with MetaMask, Rabby, Coinbase Wallet and other browser wallets. You sign a free message, nothing moves.
          </p>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="glass-control w-full"
            onClick={google}
          >
            Continue with Google
          </Button>

          <div className="my-5 h-px bg-border" />

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                  Display name
                </Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="glass-control" />
              </div>
            )}
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="glass-control"
              />
            </div>
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="glass-control"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-[image:var(--gradient-primary)] font-semibold text-primary-foreground"
            >
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Bankpad?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
        )}
        <Link to="/explore" className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground">
          Browse launches without an account
        </Link>
      </section>
      <Footer />
    </div>
  );
}
