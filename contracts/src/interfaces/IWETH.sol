// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice WETH surface. Bankpad wraps any raw ETH that arrives as fees so
/// the swap into the reward currency uses one well-defined path (WETH ->
/// rewardToken) rather than two.
interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}
