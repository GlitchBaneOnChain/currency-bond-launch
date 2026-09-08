/** Bankpad's fee model, in one place.
 *
 * Every trade on Bankpad pays two fees, taken as basis points of the trade's
 * ETH-side value:
 *
 *   - **Platform fee**: fixed at 1% forever. Routes to {@link PLATFORM_WALLET}
 *     as launchpad revenue.
 *   - **Creator fee**: chosen by the coin's creator at launch (0 to
 *     {@link MAX_CREATOR_FEE_BPS}), routes to the creator's own wallet or the
 *     per-launch distributor (so it can be paid to holders as national-currency
 *     rewards, depending on the creator's choice).
 *
 * Direct Uniswap V3 trades bypass these — the fee split is enforced at the
 * Bankpad Trader router; trades that go straight to the pool only pay the V3
 * pool fee. The frontend routes every buy/sell through the Bankpad Trader.
 */

import type { Address } from "viem";

/** The launchpad's own take. Sent to a treasury wallet the team controls. */
export const PLATFORM_WALLET: Address = "0xefEFd65A24120A61c96cfbA1A8DC861fAC03C3c7";

/** 1%, fixed forever. Enforced in {@link PLATFORM_WALLET} at the router. */
export const PLATFORM_FEE_BPS = 100;

/** Upper bound for the creator-chosen fee. 5% keeps predatory launches out. */
export const MAX_CREATOR_FEE_BPS = 500;

/** Default creator fee used by the launch form when a creator hasn't chosen. */
export const DEFAULT_CREATOR_FEE_BPS = 100;

/** Total trading fee a buyer/seller will pay on this launch. */
export function totalTradingFeeBps(creatorFeeBps: number): number {
  return PLATFORM_FEE_BPS + Math.max(0, Math.min(creatorFeeBps, MAX_CREATOR_FEE_BPS));
}

/** Format basis points as a percentage string (e.g. 150 -> "1.5%"). */
export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 1)}%`;
}
