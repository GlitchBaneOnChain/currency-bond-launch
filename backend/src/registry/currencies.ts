import type { Address } from "viem";

/** Same registry as the frontend; kept independent so the backend can
 * validate incoming launches without importing frontend code. Anything
 * missing here is not launchable — the /launches/register endpoint
 * rejects any launch that names a currency not on this list. */
export type RewardCurrencyDefinition = {
  code: string;
  address: Address;
  decimals: number;
  minPoolDepthUsd: number;
};

export const REWARD_CURRENCIES: readonly RewardCurrencyDefinition[] = [
  {
    code: "USD",
    address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
    decimals: 6,
    minPoolDepthUsd: 25_000,
  },
] as const;

export function rewardCurrency(code: string): RewardCurrencyDefinition | undefined {
  return REWARD_CURRENCIES.find((c) => c.code === code);
}

export function isLaunchable(code: string): boolean {
  return rewardCurrency(code) !== undefined;
}
