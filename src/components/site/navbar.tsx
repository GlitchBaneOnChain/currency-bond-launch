import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Landmark, Loader2, Menu, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/launch", label: "Launch" },
  { to: "/explore", label: "Explore" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function WalletButton({ full }: { full?: boolean }) {
  const [state, setState] = useState<"idle" | "connecting" | "connected">("idle");

  if (state === "connected") {
    return (
      <Button
        variant="outline"
        className={`${full ? "w-full" : ""} border-gold/40 bg-gold/10 text-gold hover:bg-gold/20`}
        onClick={() => setState("idle")}
      >
        <span className="mr-2 inline-block size-2 rounded-full bg-success" />
        <span className="num text-xs">0x91ab...42fe</span>
      </Button>
    );
  }

  return (
    <Button
      className={`${full ? "w-full" : ""} bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] hover:bg-primary`}
      disabled={state === "connecting"}
      onClick={() => {
        setState("connecting");
        setTimeout(() => setState("connected"), 1200);
      }}
    >
      {state === "connecting" ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" /> Connecting wallet...
        </>
      ) : (
        <>
          <Wallet className="mr-2 size-4" /> Connect Wallet
        </>
      )}
    </Button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/45 shadow-[inset_0_-1px_0_oklch(1_0_0/6%),0_12px_40px_-28px_oklch(0.02_0.02_264/85%)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[image:var(--gradient-gold)] text-gold-foreground shadow-[var(--shadow-gold)] transition-transform duration-300 hover:rotate-3 hover:scale-105">
            <Landmark className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Bank<span className="gold-text">pad</span>
          </span>
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
            <WalletButton />
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
              <WalletButton full />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
