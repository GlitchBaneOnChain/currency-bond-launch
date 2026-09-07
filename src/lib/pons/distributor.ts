/** ABI fragments for BankpadDistributor that the frontend reads.
 * Mirrored from contracts/src/BankpadDistributor.sol so the token page
 * can surface live burned + distributed totals without a backend call. */
export const distributorAbi = [
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
] as const;
