import { supabase } from "@/integrations/supabase/client";
import { requestWalletNonce, verifyWallet } from "@/lib/wallet.functions";

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export function getInjectedWallet(): Eip1193 | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: Eip1193 }).ethereum;
  return eth ?? null;
}

/** Connects a browser wallet, proves ownership with a signature and opens a Bankpad session. */
export async function signInWithWallet(): Promise<{ displayName: string }> {
  const wallet = getInjectedWallet();
  if (!wallet) {
    throw new Error("No wallet found. Install MetaMask or another browser wallet, then try again.");
  }

  const accounts = (await wallet.request({ method: "eth_requestAccounts" })) as string[];
  const address = accounts?.[0];
  if (!address) throw new Error("No wallet account was shared");

  const { message } = await requestWalletNonce({ data: { address } });
  const signature = (await wallet.request({
    method: "personal_sign",
    params: [message, address],
  })) as string;

  const { tokenHash, displayName } = await verifyWallet({ data: { address, signature } });
  const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
  if (error) throw new Error(error.message);
  return { displayName };
}
