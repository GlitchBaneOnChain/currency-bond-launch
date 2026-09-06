import { Link } from "@tanstack/react-router";
import { Landmark } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/40 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[image:var(--gradient-gold)] text-gold-foreground">
              <Landmark className="size-4" />
            </span>
            <span className="font-bold">
              Bank<span className="gold-text">pad</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The launchpad where every coin is paired with a real country currency. Built on Robinhood Chain.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/launch" className="hover:text-foreground">
              Launch a token
            </Link>
            <Link to="/explore" className="hover:text-foreground">
              Explore launches
            </Link>
            <Link to="/dashboard" className="hover:text-foreground">
              Creator dashboard
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Currencies</p>
          <p className="mt-3 text-sm text-muted-foreground">
            USD, EUR, GBP, JPY, CAD, AUD, INR, CHF, BRL, KRW, MXN, NGN
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        Bankpad is a demo interface. Nothing here is financial advice.
      </div>
    </footer>
  );
}
