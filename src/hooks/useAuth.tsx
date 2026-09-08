import { useCallback, useEffect, useRef, useState } from "react";
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
  /** Manually re-trigger the SIWE handshake. Handy when the wallet popup
   * was dismissed or the auto attempt errored. */
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
  const attemptedAddress = useRef<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        queryClient.invalidateQueries({ queryKey: ["account"] });
      }
      if (event === "SIGNED_OUT") {
        attemptedAddress.current = null;
        setSignInError(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const runSignIn = useCallback(
    async (address: `0x${string}`) => {
      setSigningIn(true);
      setSignInError(null);
      try {
        await signInWithWallet({ config: wagmiConfig, address });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not sign in with wallet";
        setSignInError(msg);
        // Deliberately DO NOT clear attemptedAddress here — otherwise the
        // useEffect below would re-fire the moment `signingIn` flips back
        // to false and spam the wallet with signature prompts forever. The
        // user can rerun the flow themselves via `retrySignIn` (the Sign-in
        // button on protected pages).
      } finally {
        setSigningIn(false);
      }
    },
    [wagmiConfig],
  );

  // Auto sign-in with the connected wallet, once per address per session.
  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (!wagmi.isConnected || !wagmi.address) return;
    if (signingIn) return;
    if (attemptedAddress.current === wagmi.address) return;
    attemptedAddress.current = wagmi.address;
    void runSignIn(wagmi.address);
  }, [loading, user, signingIn, wagmi.isConnected, wagmi.address, runSignIn]);

  const retrySignIn = useCallback(() => {
    if (!wagmi.address) return;
    attemptedAddress.current = null;
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
