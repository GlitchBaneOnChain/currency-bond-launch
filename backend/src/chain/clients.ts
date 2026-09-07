import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  type Address,
  type Hex,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config, ROBINHOOD_CHAIN_ID } from "../config.js";

export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [config.ROBINHOOD_RPC_URL] },
    public: { http: [config.ROBINHOOD_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
  },
});

let _publicClient: PublicClient | undefined;
export function getPublicClient(): PublicClient {
  if (!_publicClient) {
    _publicClient = createPublicClient({
      chain: robinhoodChain,
      transport: http(config.ROBINHOOD_RPC_URL),
      batch: { multicall: true },
    });
  }
  return _publicClient;
}

/** Wallet client bound to a decrypted operator private key. Callers are
 * expected to zero the plaintext buffer once they have this client. */
export function makeWalletClient(privateKey: Hex): WalletClient {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    chain: robinhoodChain,
    transport: http(config.ROBINHOOD_RPC_URL),
    account,
  });
}

export type { Address, Hex };
