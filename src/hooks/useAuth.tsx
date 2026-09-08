import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAccount as useWagmiAccount } from "wagmi";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAccount } from "@/lib/account.functions";
import { signInWithWallet } from "@/lib/wallet-client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const queryClient = useQueryClient();
  const wagmi = useWagmiAccount();
  const lastSignedAddress = useRef<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        queryClient.invalidateQueries({ queryKey: ["account"] });
      }
      if (event === "SIGNED_OUT") lastSignedAddress.current = null;
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Auto sign-in-with-wallet: when RainbowKit/wagmi reports a connected wallet
  // but Supabase has no session yet, run the SIWE-style handshake once so
  // protected pages (dashboard, launch) work without a second click.
  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (!wagmi.isConnected || !wagmi.address) return;
    if (signingIn) return;
    if (lastSignedAddress.current === wagmi.address) return;
    lastSignedAddress.current = wagmi.address;
    setSigningIn(true);
    signInWithWallet()
      .catch(() => {
        // Reset so the user can retry (or another wallet change triggers again)
        lastSignedAddress.current = null;
      })
      .finally(() => setSigningIn(false));
  }, [loading, user, signingIn, wagmi.isConnected, wagmi.address]);

  return { user, loading: loading || signingIn };
}

export function useAccount() {
  const { user } = useAuth();
  const fetchAccount = useServerFn(getAccount);
  return useQuery({
    queryKey: ["account", user?.id ?? "anon"],
    queryFn: () => fetchAccount(),
    enabled: Boolean(user),
  });
}
