import { signMessage } from "@wagmi/core";
import type { Config } from "wagmi";
import { supabase } from "@/integrations/supabase/client";
import { requestWalletNonce, verifyWallet } from "@/lib/wallet.functions";

/** Sign the SIWE nonce with whatever wallet the user connected via wagmi
 * (MetaMask injected, WalletConnect mobile, Coinbase Wallet, etc), verify
 * the signature server-side, then open a Supabase session bound to that
 * wallet. `config` is wagmi's runtime config — we take it from the caller so
 * this module doesn't have to import the app-level provider. */
export async function signInWithWallet({
  config,
  address,
}: {
  config: Config;
  address: `0x${string}`;
}): Promise<{ displayName: string }> {
  const { message } = await requestWalletNonce({ data: { address } });
  const signature = await signMessage(config, { account: address, message });

  const { tokenHash, displayName } = await verifyWallet({
    data: { address, signature },
  });
  const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
  if (error) throw new Error(error.message);
  return { displayName };
}
