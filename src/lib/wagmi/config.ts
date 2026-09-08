import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  rabbyWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { robinhoodChain } from "@/lib/chain/robinhood-chain";

/** WalletConnect Cloud project id. Ships a temporary dev id so local dev works
 * out of the box; production deployments must set VITE_WALLETCONNECT_PROJECT_ID. */
const projectId =
  (import.meta.env["VITE_WALLETCONNECT_PROJECT_ID"] as string | undefined) ??
  "bankpad-dev";

/** wagmi config for Bankpad. Robinhood Chain is the only supported chain;
 * everything else is rejected at connect-time by RainbowKit and again by the
 * chain-switch prompt when the user tries to sign a launch. */
export const wagmiConfig = getDefaultConfig({
  appName: "Bankpad",
  appDescription:
    "Launch memecoins that reward holders in real country currencies on Robinhood Chain.",
  appUrl: "https://bankpad.fun",
  projectId,
  chains: [robinhoodChain],
  transports: {
    [robinhoodChain.id]: http(),
  },
  wallets: [
    {
      groupName: "Recommended",
      // Explicit wallet list so each entry maps to a specific EIP-6963
      // provider — no `injectedWallet` catch-all, which would silently
      // route "MetaMask" clicks to whatever wallet grabbed
      // `window.ethereum` first (usually Trust or Rabby when both are
      // installed). Coinbase Wallet is temporarily off the list: its
      // bundled x402 signer pulls a peer dep whose current release is
      // missing an export and breaks the Vite build. Re-add once
      // cdp-sdk lines up.
      wallets: [
        metaMaskWallet,
        rabbyWallet,
        rainbowWallet,
        trustWallet,
        walletConnectWallet,
      ],
    },
  ],
  ssr: true,
});
