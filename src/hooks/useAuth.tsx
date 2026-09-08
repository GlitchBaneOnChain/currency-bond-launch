import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAccount as useWagmiAccount, useConfig as useWagmiConfig } from "wagmi";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAccount } from "@/lib/account.functions";
import { signInWithWallet } from "@/lib/wallet-client";

type AuthState = {
  user: User | null;
  loading: boolean;
  signingIn: boolean;
  signInError: string | null;
  /** Manually trigger the SIWE handshake. Called from the Sign-in button
   * on the dashboard and the /auth page — never fires on its own. */
  retrySignIn: () => void;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const wagmi = useWagmiAccount();
  const wagmiConfig = useWagmiConfig();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        queryClient.invalidateQueries({ queryKey: ["account"] });
      }
      if (event === "SIGNED_OUT") setSignInError(null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const runSignIn = useCallback(
    async (address: `0x${string}`) => {
      if (signingIn) return;
      setSigningIn(true);
      setSignInError(null);
      try {
        await signInWithWallet({ config: wagmiConfig, address });
      } catch (err) {
        setSignInError(err instanceof Error ? err.message : "Could not sign in with wallet");
      } finally {
        setSigningIn(false);
      }
    },
    [wagmiConfig, signingIn],
  );

  const retrySignIn = useCallback(() => {
    if (!wagmi.address) return;
    void runSignIn(wagmi.address);
  }, [wagmi.address, runSignIn]);

  return { user, loading, signingIn, signInError, retrySignIn };
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
