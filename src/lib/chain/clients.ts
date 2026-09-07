import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";
import { robinhoodChain } from "./robinhood-chain";

/** Public client Bankpad uses for every on-chain read (holders, prices,
 * fee balances, event filters). Cached per-process. */
let _publicClient: PublicClient | undefined;
export function getPublicClient(): PublicClient {
  if (!_publicClient) {
    _publicClient = createPublicClient({
      chain: robinhoodChain,
      transport: http(),
      batch: { multicall: true },
    });
  }
  return _publicClient;
}

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function injected(): Eip1193 | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { ethereum?: Eip1193 }).ethereum;
}

/** Wallet client bound to the injected provider (MetaMask, Rabby, Coinbase
 * Wallet, etc.) targeting the caller's currently-selected account. Returns
 * undefined on SSR or when no injected provider is present. Prompt the user
 * to install a wallet at the UI layer in that case. */
export function getWalletClient(account?: Address): WalletClient | undefined {
  const eth = injected();
  if (!eth) return undefined;
  return createWalletClient({
    chain: robinhoodChain,
    transport: custom(eth),
    ...(account ? { account } : {}),
  });
}
