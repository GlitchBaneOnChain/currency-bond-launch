// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV3SwapRouter} from "../../src/interfaces/IUniswapV3SwapRouter.sol";

/// @notice Deterministic swap router mock: pulls `amountIn` of `tokenIn`
/// from the caller and pays out `amountIn * rateBps / 10_000` of the
/// pre-funded `tokenOut` balance. Used to test slippage, approvals and
/// balance accounting without spinning up a fork.
contract MockSwapRouter is IUniswapV3SwapRouter {
    uint256 public rateBps = 10_000; // 1:1 by default

    function setRate(uint256 bps) external {
        rateBps = bps;
    }

    function exactInputSingle(ExactInputSingleParams calldata p)
        external
        payable
        override
        returns (uint256 amountOut)
    {
        IERC20(p.tokenIn).transferFrom(msg.sender, address(this), p.amountIn);
        amountOut = (p.amountIn * rateBps) / 10_000;
        IERC20(p.tokenOut).transfer(p.recipient, amountOut);
    }
}
