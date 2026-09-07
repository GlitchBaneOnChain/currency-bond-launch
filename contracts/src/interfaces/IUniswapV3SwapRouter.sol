// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Minimal Uniswap V3 SwapRouter surface for a single-hop exact-input
/// swap. Used by the distributor to convert WETH fees into the reward
/// currency (USDG by default) on the same block as the buy job runs.
interface IUniswapV3SwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);
}
