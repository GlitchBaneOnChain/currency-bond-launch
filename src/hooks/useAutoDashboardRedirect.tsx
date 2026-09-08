import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useNavigate, useRouterState } from "@tanstack/react-router";

/** After a wallet connects, drop the user straight into their dashboard —
 * unless they were already deep in a task (launching a coin, viewing a token,
 * mid-auth). Only fires once per session per address, so the navigation
 * doesn't fight the user if they navigate away and come back. */
const LANDING_PATHS = new Set(["/", "/auth"]);

export function useAutoDashboardRedirect(): void {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const redirected = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) return;
    if (redirected.current === address) return;
    if (!LANDING_PATHS.has(path)) return;
    redirected.current = address;
    navigate({ to: "/dashboard" });
  }, [isConnected, address, path, navigate]);
}
