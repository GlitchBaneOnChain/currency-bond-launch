import type { Address } from "viem";

/** A reward currency a creator can choose at launch time. Immutable per token.
 *
 * Only tokens that have a verified deep pool against WETH/ETH on Robinhood
 * Chain's Uniswap deployment belong in this list. Never trust a client-supplied
 * reward token address; the launch UI and the backend both consult this
 * registry and the backend re-verifies pool depth before publishing a coin. */
export type RewardCurrencyDefinition = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
  /** ERC-20 address on Robinhood Chain (chain 4663). */
  address: Address;
  /** ERC-20 decimals for the currency token. */
  decimals: number;
  /** Human-readable minimum-depth requirement, in USD terms, for a launch to
   * be allowed to select this currency. Enforced backend-side against live
   * Uniswap reserves before the launch is accepted. */
  minPoolDepthUsd: number;
};

/** Allowlisted reward currencies. Start with USDG; extend as more country
 * currencies get real Uniswap depth on Robinhood Chain. */
export const REWARD_CURRENCIES: readonly RewardCurrencyDefinition[] = [
  {
    code: "USDG",
    name: "US Dollar (Global Dollar)",
    symbol: "$",
    flag: "🇺🇸",
    country: "United States",
    address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
    decimals: 6,
    minPoolDepthUsd: 25_000,
  },
] as const;

export function rewardCurrency(code: string): RewardCurrencyDefinition | undefined {
  return REWARD_CURRENCIES.find((c) => c.code === code);
}

/** Case-sensitive address lookup. Returns undefined for unlisted currencies. */
export function rewardCurrencyByAddress(
  address: string,
): RewardCurrencyDefinition | undefined {
  const lower = address.toLowerCase();
  return REWARD_CURRENCIES.find((c) => c.address.toLowerCase() === lower);
}
