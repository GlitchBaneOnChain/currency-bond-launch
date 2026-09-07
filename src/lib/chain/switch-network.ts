import { robinhoodChain } from "./robinhood-chain";

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

/** Standard EIP-1193 error thrown when a chain is not yet added to the wallet. */
const CHAIN_NOT_ADDED = 4902;

function hex(n: number): string {
  return `0x${n.toString(16)}`;
}

/** Ensure the injected wallet is on Robinhood Chain (id 4663). If the chain
 * is unknown to the wallet we add it first, then switch. Throws when the user
 * rejects either prompt. */
export async function ensureRobinhoodChain(wallet: Eip1193): Promise<void> {
  const chainIdHex = hex(robinhoodChain.id);
  try {
    await wallet.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    return;
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code !== CHAIN_NOT_ADDED) throw err;
    // The wallet does not know about Robinhood Chain yet; add then switch in
    // one gesture so the user only sees one modal in the happy path.
    await wallet.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: robinhoodChain.name,
          nativeCurrency: robinhoodChain.nativeCurrency,
          rpcUrls: [...robinhoodChain.rpcUrls.default.http],
          blockExplorerUrls: robinhoodChain.blockExplorers
            ? [robinhoodChain.blockExplorers.default.url]
            : undefined,
        },
      ],
    });
  }
}
