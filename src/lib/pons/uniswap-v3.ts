import type { Address } from "viem";

/** Canonical Uniswap V3 deployment on Robinhood Chain (id 4663).
 * See https://github.com/Uniswap/contracts/blob/main/deployments/4663.md */
export const UNISWAP_V3_FACTORY = "0x1f7d7550B1b028f7571E69A784071F0205FD2EfA" as Address;
export const UNISWAP_V3_NFPM = "0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3" as Address;
export const UNISWAP_V3_SWAP_ROUTER = "0xcaf681a66D020601342297493863e78c959E5cB2" as Address;
export const UNISWAP_V3_UNIVERSAL_ROUTER =
  "0x8876789976DEcBFcbBBE364623c63652dB8c0904" as Address;

/** Minimal ABI for the calls the automation engine makes:
 *   - `collect(...)` to claim accrued token + WETH fees to the fee wallet
 *   - `positions(...)` to read `tokensOwed0/1` before deciding to collect. */
export const nfpmAbi = [
  {
    type: "function",
    name: "collect",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "amount0Max", type: "uint128" },
          { name: "amount1Max", type: "uint128" },
        ],
      },
    ],
    outputs: [
      { name: "amount0", type: "uint256" },
      { name: "amount1", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "positions",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "nonce", type: "uint96" },
      { name: "operator", type: "address" },
      { name: "token0", type: "address" },
      { name: "token1", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickLower", type: "int24" },
      { name: "tickUpper", type: "int24" },
      { name: "liquidity", type: "uint128" },
      { name: "feeGrowthInside0LastX128", type: "uint256" },
      { name: "feeGrowthInside1LastX128", type: "uint256" },
      { name: "tokensOwed0", type: "uint128" },
      { name: "tokensOwed1", type: "uint128" },
    ],
  },
] as const;

/** Uniswap V3 pool ABI slice for reading spot price + liquidity when the
 * automation engine needs to enforce the pool-depth floor before a
 * currency buy. */
export const v3PoolAbi = [
  {
    type: "function",
    name: "slot0",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "liquidity",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint128" }],
  },
  {
    type: "function",
    name: "token0",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "token1",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "fee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint24" }],
  },
] as const;

/** Uniswap V3 factory ABI slice for computing pool addresses. */
export const v3FactoryAbi = [
  {
    type: "function",
    name: "getPool",
    stateMutability: "view",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
] as const;
