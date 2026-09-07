import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/site/wallet-button";
import bankpadLogo from "@/assets/bankpad-green-logo.jpg.asset.json";

const NAV = [
  { to: "/launch", label: "Launch" },
  { to: "/explore", label: "Explore" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

/** Backwards-compat re-export for any page that still imports AccountButton.
 * The header now routes through the wagmi + RainbowKit `WalletButton`. */
export { WalletButton as AccountButton };

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
