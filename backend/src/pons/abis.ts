/** ABI fragments the backend calls, mirrored from the frontend package.
 * Kept together so any ABI drift is one file to review. */

export const PONS_V1_FACTORY_ADDRESS =
  "0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB" as const;

/** Minimal launched-token ABI: the fields the backend needs to run the
 * reward loop and to render totals in the UI. */
export const launcherTokenAbi = [
  {
    type: "function",
    name: "feeWallet",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "liquidityPool",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Transfer",
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
  },
] as const;

/** BankpadDistributor ABI (mirrored from contracts/src/BankpadDistributor.sol). */
export const distributorAbi = [
  {
    type: "function",
    name: "claimAndBurn",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [
      { name: "burned", type: "uint256" },
      { name: "wethIn", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "buyRewards",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "poolFee", type: "uint24" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "distribute",
    stateMutability: "nonpayable",
    inputs: [{ name: "holders", type: "address[]" }],
    outputs: [],
  },
  {
    type: "function",
    name: "pendingFees",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "memeOwed", type: "uint128" },
      { name: "wethOwed", type: "uint128" },
    ],
  },
  {
    type: "function",
    name: "pendingRewards",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "isEligible",
    stateMutability: "view",
    inputs: [{ name: "holder", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "totalBurned",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalDistributed",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "lastDistribution",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "FeesClaimed",
    anonymous: false,
    inputs: [
      { indexed: false, name: "memeAmount", type: "uint256" },
      { indexed: false, name: "wethAmount", type: "uint256" },
      { indexed: false, name: "burned", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "RewardsBought",
    anonymous: false,
    inputs: [
      { indexed: false, name: "wethIn", type: "uint256" },
      { indexed: false, name: "rewardsOut", type: "uint256" },
      { indexed: false, name: "amountOutMin", type: "uint256" },
      { indexed: false, name: "fee", type: "uint24" },
    ],
  },
  {
    type: "event",
    name: "Distributed",
    anonymous: false,
    inputs: [
      { indexed: false, name: "rewardsPaid", type: "uint256" },
      { indexed: false, name: "eligibleHolders", type: "uint256" },
      { indexed: false, name: "eligibleSupplySnapshot", type: "uint256" },
      { indexed: false, name: "caller", type: "address" },
      { indexed: false, name: "operatorTriggered", type: "bool" },
    ],
  },
] as const;
