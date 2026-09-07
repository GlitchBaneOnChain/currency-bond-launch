import type { Address } from "viem";

/** A reward currency a creator can pick at launch time. Immutable per token.
 *
 * `code` is the display symbol (USD, EUR, GBP …) — the same taxonomy the
 * marketing site uses. Under the hood each entry names the specific on-chain
 * ERC-20 that holders actually receive: for USD that's Global Dollar (USDG).
 *
 * Only entries in this list are launchable. Anything you see on the site with
 * no entry here is aspirational and disabled in the launch form; the launch
 * page renders it with a "Coming soon" badge so the roster is honest. */
export type RewardCurrencyDefinition = {
  /** UI-facing code (USD, EUR, GBP …). */
  code: string;
  /** Human-readable country name. */
  country: string;
  /** Symbol prefix for prices (`$`, `€`, …). */
  symbol: string;
  /** Flag emoji. */
  flag: string;
  /** The reward token's on-chain symbol as it appears on the ERC-20 (USDG, …). */
  tokenSymbol: string;
  /** Human-readable name of the reward token. */
  tokenName: string;
  /** ERC-20 address on Robinhood Chain (chain 4663). */
  address: Address;
  /** ERC-20 decimals. */
  decimals: number;
  /** Minimum WETH-paired liquidity depth (in USD terms) the reward-currency
   * pool must clear before a launch is allowed to select this currency.
   * Enforced backend-side against live Uniswap reserves at launch time. */
  minPoolDepthUsd: number;
};

export const REWARD_CURRENCIES: readonly RewardCurrencyDefinition[] = [
  {
    code: "USD",
    country: "United States",
    symbol: "$",
    flag: "🇺🇸",
    tokenSymbol: "USDG",
    tokenName: "Global Dollar",
    address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
    decimals: 6,
    minPoolDepthUsd: 25_000,
  },
] as const;

export function rewardCurrency(code: string): RewardCurrencyDefinition | undefined {
  return REWARD_CURRENCIES.find((c) => c.code === code);
}

/** True when a UI currency code has a launchable on-chain reward token
 * behind it (the reward-currency registry names an ERC-20). The launch UI
 * disables currencies where this is false. */
export function isLaunchable(code: string): boolean {
  return rewardCurrency(code) !== undefined;
}

/** Case-sensitive address lookup. Returns undefined for unlisted currencies. */
export function rewardCurrencyByAddress(
  address: string,
): RewardCurrencyDefinition | undefined {
  const lower = address.toLowerCase();
  return REWARD_CURRENCIES.find((c) => c.address.toLowerCase() === lower);
}
