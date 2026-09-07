// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {INonfungiblePositionManager} from "../../src/interfaces/INonfungiblePositionManager.sol";

/// @notice Minimal NFPM stub. Pre-fund it with meme+WETH tokens, then set
/// `owed0`/`owed1`; `collect()` transfers those balances to the recipient
/// and zeros the owed values, matching the shape of a real V3 collect.
contract MockNfpm is INonfungiblePositionManager {
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint128 public owed0;
    uint128 public owed1;

    constructor(IERC20 _token0, IERC20 _token1) {
        token0 = _token0;
        token1 = _token1;
    }

    function setOwed(uint128 _owed0, uint128 _owed1) external {
        owed0 = _owed0;
        owed1 = _owed1;
    }

    function collect(CollectParams calldata params)
        external
        payable
        override
        returns (uint256 amount0, uint256 amount1)
    {
        amount0 = owed0;
        amount1 = owed1;
        owed0 = 0;
        owed1 = 0;
        if (amount0 > 0) token0.transfer(params.recipient, amount0);
        if (amount1 > 0) token1.transfer(params.recipient, amount1);
    }

    function positions(uint256)
        external
        view
        override
        returns (
            uint96,
            address,
            address,
            address,
            uint24,
            int24,
            int24,
            uint128,
            uint256,
            uint256,
            uint128,
            uint128
        )
    {
        return (
            0, address(0), address(token0), address(token1), 3000, 0, 0, 0, 0, 0, owed0, owed1
        );
    }
}
