/** Thin client for the Bankpad backend. All calls are best-effort from
 * the frontend's perspective — if the backend is offline the launch flow
 * still writes to Supabase and the user is not blocked. Once the backend
 * is deployed the frontend URL comes from VITE_BANKPAD_API_URL. */

const API_URL =
  (import.meta.env["VITE_BANKPAD_API_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "";

export type LaunchRegisterInput = {
  address: string;
  name: string;
  ticker: string;
  emoji?: string;
  description: string;
  rewardCurrencyCode: string;
  feeWallet: string;
  poolAddress: string;
  lockerAddress: string;
  positionId: string; // decimal string; the DB stores BigInt
  launchTxHash: string;
  creatorAddress: string;
  creatorTaxBps: number;
  website?: string;
  twitter?: string;
  telegram?: string;
};

/** POST /launches/register. Fire-and-forget from the launch page — the
 * user's coin is already on chain by the time we call this. */
export async function registerLaunch(input: LaunchRegisterInput): Promise<void> {
  if (!API_URL) return; // backend not wired yet in this environment
  try {
    const res = await fetch(`${API_URL}/launches/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.warn(`[bankpad] registerLaunch failed: ${res.status} ${body}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[bankpad] registerLaunch threw:", err);
  }
}
