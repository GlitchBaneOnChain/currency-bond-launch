import type { Address } from "viem";

/** Official Pons V1 factory on Robinhood Chain. Deploys the token, opens the
 * one-sided Uniswap V3 position, and locks the NFT with the configured locker. */
export const PONS_V1_FACTORY_ADDRESS =
  "0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB" as const;

/** Socials tuple accepted by `launchToken`. Empty strings are fine for fields
 * the creator does not want to publish. */
export type LauncherSocials = {
  twitter: string;
  telegram: string;
  discord: string;
  website: string;
  farcaster: string;
};

/** Params tuple accepted by `launchToken`.
 *
 * `feeWallet` is the address that becomes the collectable owner for the V3
 * position's fees. For Bankpad this must be either the creator's own address
 * (they later authorize the automation engine to pull) or the Bankpad
 * distributor contract that runs the reward loop on their behalf. */
export type LauncherTokenParams = {
  name: string;
  symbol: string;
  logo: string;
  description: string;
  socials: LauncherSocials;
  feeWallet: Address;
};

/** Minimal ABI for the factory calls Bankpad makes. */
export const ponsV1FactoryAbi = [
  {
    type: "function",
    name: "launchToken",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "logo", type: "string" },
          { name: "description", type: "string" },
          {
            name: "socials",
            type: "tuple",
            components: [
              { name: "twitter", type: "string" },
              { name: "telegram", type: "string" },
              { name: "discord", type: "string" },
              { name: "website", type: "string" },
              { name: "farcaster", type: "string" },
            ],
          },
          { name: "feeWallet", type: "address" },
        ],
      },
      { name: "launchConfigId", type: "uint256" },
      { name: "dexId", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [{ name: "token", type: "address" }],
  },
  {
    type: "function",
    name: "launchFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "TokenLaunched",
    anonymous: false,
    inputs: [
      { indexed: true, name: "token", type: "address" },
      { indexed: true, name: "deployer", type: "address" },
      { indexed: true, name: "dexFactory", type: "address" },
      { indexed: false, name: "pairToken", type: "address" },
      { indexed: false, name: "pool", type: "address" },
      { indexed: false, name: "dexId", type: "uint256" },
      { indexed: false, name: "launchConfigId", type: "uint256" },
      { indexed: false, name: "positionId", type: "uint256" },
      { indexed: false, name: "restrictionsEndBlock", type: "uint256" },
      { indexed: false, name: "initialBuyAmount", type: "uint256" },
    ],
  },
] as const;
