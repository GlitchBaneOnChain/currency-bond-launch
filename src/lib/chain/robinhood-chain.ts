import { defineChain } from "viem";

/** Robinhood Chain (mainnet).
 *
 * All Bankpad reads and writes target this chain. When a wallet is on a
 * different network the UI prompts the user to switch here.
 */
export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
    public: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
  },
});

/** Canonical Permit2 (same address on every EVM chain). */
export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3" as const;

/** Wrapped ETH on Robinhood Chain (used as the fee-side / swap-hop token). */
export const WETH_ADDRESS = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73" as const;

/** Standard burn sink. Meme-token portion of collected fees is sent here. */
export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;
