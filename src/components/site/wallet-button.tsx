import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, Wallet, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { robinhoodChain } from "@/lib/chain/robinhood-chain";

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
export function WalletButton({ full }: { full?: boolean }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <div className={`h-9 ${full ? "w-full" : "w-32"} animate-pulse rounded-md bg-secondary/60`} />
          );
        }

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              className={`${full ? "w-full" : ""} bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] hover:bg-primary`}
            >
              <Wallet className="mr-2 size-4" />
              Connect wallet
            </Button>
          );
        }

        if (chain.unsupported || chain.id !== robinhoodChain.id) {
          return (
            <Button
              onClick={openChainModal}
              variant="outline"
              className={`${full ? "w-full" : ""} border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/20`}
            >
              <AlertTriangle className="mr-2 size-4" />
              Switch to Robinhood Chain
            </Button>
          );
        }

        return (
          <Button
            variant="outline"
            className={`${full ? "w-full" : ""} border-primary/40 bg-primary/10 text-primary hover:bg-primary/20`}
            onClick={openAccountModal}
          >
            <Wallet className="mr-2 size-4" />
            <span className="num max-w-[140px] truncate text-xs">
              {account.displayName}
            </span>
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}

/** Full-screen fallback while wagmi hydrates. Used in the mobile menu. */
export function WalletButtonSkeleton({ full }: { full?: boolean }) {
  return (
    <Button disabled className={`${full ? "w-full" : ""} bg-secondary/60 text-muted-foreground`}>
      <Loader2 className="mr-2 size-4 animate-spin" />
      Loading wallet…
    </Button>
  );
}
