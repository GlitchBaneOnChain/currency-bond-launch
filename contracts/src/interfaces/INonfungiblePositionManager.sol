// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Minimal slice of Uniswap V3's NonfungiblePositionManager that
/// Bankpad's distributor calls. Kept as its own interface so the contract
/// links against a stable ABI regardless of the deployed version.
interface INonfungiblePositionManager {
    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }

    /// @notice Pull accrued fees from the position identified by `tokenId`
    /// to the given `recipient`. Only the owner or approved operator of the
    /// position NFT can call this; Bankpad uses the standard Pons pattern of
    /// setting the launched token's `feeWallet` (this distributor) as the
    /// collect recipient so the position NFT itself stays locked.
    function collect(CollectParams calldata params)
        external
        payable
        returns (uint256 amount0, uint256 amount1);

    /// @notice Read the tokens owed on the given position. Bankpad checks
    /// this before every `claimAndBurn` to no-op when there's nothing to
    /// collect and save the gas.
    function positions(uint256 tokenId)
        external
        view
        returns (
            uint96 nonce,
            address operator,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        );
}
