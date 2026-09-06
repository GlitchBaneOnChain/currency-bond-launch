import { createServerFn } from "@tanstack/react-start";

const DOMAIN = "bankpad.app";

function normalize(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("That does not look like a wallet address");
  return address.toLowerCase();
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function walletMessage(address: string, nonce: string) {
  return `Bankpad wants you to sign in with your wallet.\n\nWallet: ${address}\nCode: ${nonce}\n\nSigning is free and does not move any funds.`;
}

export const requestWalletNonce = createServerFn({ method: "POST" })
  .inputValidator((data: { address: string }) => ({ address: normalize(data.address) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nonce = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabaseAdmin
      .from("wallet_challenges")
      .upsert({ address: data.address, nonce, created_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { message: walletMessage(data.address, nonce) };
  });

export const verifyWallet = createServerFn({ method: "POST" })
  .inputValidator((data: { address: string; signature: string }) => ({
    address: normalize(data.address),
    signature: data.signature,
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyMessage } = await import("viem");

    const { data: challenge } = await supabaseAdmin
      .from("wallet_challenges")
      .select("nonce, created_at")
      .eq("address", data.address)
      .maybeSingle();
    const row = challenge as { nonce: string; created_at: string } | null;
    if (!row) throw new Error("Start the wallet connection again");
    if (Date.now() - new Date(row.created_at).getTime() > 10 * 60 * 1000) {
      throw new Error("That signing request expired. Try again.");
    }

    const valid = await verifyMessage({
      address: data.address as `0x${string}`,
      message: walletMessage(data.address, row.nonce),
      signature: data.signature as `0x${string}`,
    });
    if (!valid) throw new Error("That signature did not match the wallet");

    await supabaseAdmin.from("wallet_challenges").delete().eq("address", data.address);

    const email = `${data.address}@wallet.${DOMAIN}`;
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("wallet_address", data.address)
      .maybeSingle();

    let userId = (existing as { id: string } | null)?.id ?? null;
    if (!userId) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { display_name: shortAddress(data.address), wallet_address: data.address },
      });
      if (created.error) {
        if (!created.error.message.toLowerCase().includes("already")) throw new Error(created.error.message);
      }
      userId = created.data.user?.id ?? null;
      if (!userId) {
        const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        userId = list.data.users.find((u) => u.email === email)?.id ?? null;
      }
      if (!userId) throw new Error("Could not open an account for that wallet");
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: userId, display_name: shortAddress(data.address), wallet_address: data.address });
    }

    const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error) throw new Error(link.error.message);
    const tokenHash = link.data.properties?.hashed_token;
    if (!tokenHash) throw new Error("Could not finish signing you in");

    return { tokenHash, displayName: shortAddress(data.address) };
  });
