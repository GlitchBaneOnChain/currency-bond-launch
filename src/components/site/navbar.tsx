import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, Menu, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAccount, useAuth } from "@/hooks/useAuth";
import { signInWithWallet } from "@/lib/wallet-client";
import { toast } from "sonner";
import { currency } from "@/lib/market";
import bankpadLogo from "@/assets/bankpad-green-logo.jpg.asset.json";

const NAV = [
  { to: "/launch", label: "Launch" },
  { to: "/explore", label: "Explore" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function AccountButton({ full }: { full?: boolean }) {
  const { user, loading } = useAuth();
  const { data: account } = useAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  if (loading) return <div className={`h-9 ${full ? "w-full" : "w-28"} animate-pulse rounded-md bg-secondary/60`} />;

  if (!user) {
    return (
      <Button
        disabled={connecting}
        onClick={async () => {
          setConnecting(true);
          try {
            const { displayName } = await signInWithWallet();
            toast.success(`Connected as ${displayName}`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Could not connect that wallet";
            toast.error(msg);
            if (msg.startsWith("No wallet found")) navigate({ to: "/auth" });
          } finally {
            setConnecting(false);
          }
        }}
        className={`${full ? "w-full" : ""} bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] hover:bg-primary`}
      >
        {connecting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Wallet className="mr-2 size-4" />}
        Connect wallet
      </Button>
    );
  }

  const top = [...(account?.balances ?? [])].sort((a, b) => b.amount - a.amount)[0];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className={`relative ${full ? "w-full" : ""}`}>
      <Button
        variant="outline"
        className={`${full ? "w-full" : ""} border-primary/40 bg-primary/10 text-primary hover:bg-primary/20`}
        onClick={() => setOpen((o) => !o)}
      >
        <Wallet className="mr-2 size-4" />
        <span className="num max-w-[130px] truncate text-xs">{account?.displayName ?? user.email}</span>
      </Button>
      {open && (
        <div className="glass-panel absolute right-0 z-50 mt-2 w-60 rounded-xl border p-3 text-sm">
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          {top && (
            <p className="num mt-2 text-xs">
              {currency(top.currency).flag} {currency(top.currency).symbol}
              {top.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} available
            </p>
          )}
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-md px-2 py-2 hover:bg-secondary/60"
          >
            Your dashboard
          </Link>
          <button
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/45 shadow-[inset_0_-1px_0_oklch(1_0_0/6%),0_12px_40px_-28px_oklch(0.02_0.02_264/85%)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center">
          <img src={bankpadLogo.url} alt="Bankpad" className="h-10 w-auto max-w-[190px] object-contain sm:max-w-[220px]" />
          <span className="ml-1 hidden rounded-full border border-border bg-card/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:inline">
            Robinhood Chain
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "bg-secondary text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-secondary/60 hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <AccountButton />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="glass-panel border-t border-border/60 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-3">
              <AccountButton full />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
