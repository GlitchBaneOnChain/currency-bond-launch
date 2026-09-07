import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "./config";
import { robinhoodChain } from "@/lib/chain/robinhood-chain";

/** Bankpad's Web3 provider stack.
 *
 * Kept as a separate component so the root can mount it inside a ClientOnly
 * boundary — RainbowKit's modal and wagmi's connector state need `window`
 * and would otherwise trip TanStack Start's SSR pass. TanStack Query is
 * already provided at the root, so this only adds the wagmi + RainbowKit
 * layers on top. */
export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        initialChain={robinhoodChain}
        theme={darkTheme({
          accentColor: "#22c55e",
          accentColorForeground: "#04140b",
          borderRadius: "large",
          overlayBlur: "small",
        })}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
