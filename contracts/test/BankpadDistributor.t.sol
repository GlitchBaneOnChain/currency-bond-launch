// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {BankpadDistributor} from "../src/BankpadDistributor.sol";
import {INonfungiblePositionManager} from "../src/interfaces/INonfungiblePositionManager.sol";
import {IUniswapV3SwapRouter} from "../src/interfaces/IUniswapV3SwapRouter.sol";
import {IWETH} from "../src/interfaces/IWETH.sol";

import {MockERC20} from "./mocks/MockERC20.sol";
import {MockWETH} from "./mocks/MockWETH.sol";
import {MockNfpm} from "./mocks/MockNfpm.sol";
import {MockSwapRouter} from "./mocks/MockSwapRouter.sol";

contract BankpadDistributorTest is Test {
    address constant DEAD = 0x000000000000000000000000000000000000dEaD;
    address owner = makeAddr("owner");
    address operator = makeAddr("operator");
    address creatorWallet = makeAddr("creator");
    address pool = makeAddr("pool");
    address locker = makeAddr("locker");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address whale = makeAddr("whale");
    address stranger = makeAddr("stranger");

    uint256 constant CREATOR_FEE_BPS = 200; // 2%
    address constant PLATFORM_WALLET = 0xefEFd65A24120A61c96cfbA1A8DC861fAC03C3c7;
    uint256 constant PLATFORM_FEE_BPS = 100; // 1%

    MockERC20 meme;
    MockERC20 reward;
    MockWETH weth;
    MockNfpm nfpm;
    MockSwapRouter router;
    BankpadDistributor distributor;

    uint256 constant SUPPLY = 1_000_000_000e18;
    uint256 constant POSITION_ID = 42;

    function setUp() public {
        meme = new MockERC20("Bankpad Meme", "MEME", 18);
        reward = new MockERC20("Global Dollar", "USDG", 6);
        weth = new MockWETH();
        nfpm = new MockNfpm(IERC20(address(meme)), IERC20(address(weth)));
        router = new MockSwapRouter();

        distributor = new BankpadDistributor(
            owner,
            operator,
            creatorWallet,
            CREATOR_FEE_BPS,
            IERC20(address(meme)),
            IERC20(address(reward)),
            IWETH(address(weth)),
            INonfungiblePositionManager(address(nfpm)),
            IUniswapV3SwapRouter(address(router)),
            pool,
            locker,
            POSITION_ID
        );

        meme.mint(alice, 40_000_000e18); // 4% exactly - edge, should be eligible
        meme.mint(bob, 10_000_000e18); // 1%
        meme.mint(whale, 50_000_000e18); // 5% - ineligible
        meme.mint(pool, 500_000_000e18);
        meme.mint(locker, 400_000_000e18);
        // Total minted: 1_000_000_000e18 = SUPPLY
        assertEq(meme.totalSupply(), SUPPLY);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////////////////*/

    function test_constructor_setsImmutables() public view {
        assertEq(distributor.owner(), owner);
        assertEq(distributor.operator(), operator);
        assertEq(address(distributor.token()), address(meme));
        assertEq(address(distributor.rewardToken()), address(reward));
        assertEq(address(distributor.weth()), address(weth));
        assertEq(distributor.pool(), pool);
        assertEq(distributor.locker(), locker);
        assertEq(distributor.positionId(), POSITION_ID);
        assertFalse(distributor.paused());
    }

    function test_constructor_rejectsZeroOperator() public {
        vm.expectRevert(BankpadDistributor.ZeroAddress.selector);
        new BankpadDistributor(
            owner,
            address(0),
            creatorWallet,
            CREATOR_FEE_BPS,
            IERC20(address(meme)),
            IERC20(address(reward)),
            IWETH(address(weth)),
            INonfungiblePositionManager(address(nfpm)),
            IUniswapV3SwapRouter(address(router)),
            pool,
            locker,
            POSITION_ID
        );
    }

    /*//////////////////////////////////////////////////////////////////////////
                                CLAIM AND BURN
    //////////////////////////////////////////////////////////////////////////*/

    function test_claimAndBurn_burnsMemeSplitsWeth() public {
        // Pre-fund the NFPM so its collect() has something to transfer.
        meme.mint(address(nfpm), 1_000e18);
        vm.deal(address(this), 5 ether);
        weth.deposit{value: 5 ether}();
        weth.transfer(address(nfpm), 5 ether);
        nfpm.setOwed(1_000e18, 5 ether);

        uint256 expectedPlatform = (5 ether * PLATFORM_FEE_BPS) / 10_000;
        uint256 expectedCreator = (5 ether * CREATOR_FEE_BPS) / 10_000;
        uint256 expectedRewardPool = 5 ether - expectedPlatform - expectedCreator;

        vm.prank(stranger); // permissionless
        (uint256 burned, uint256 wethIn) = distributor.claimAndBurn();

        assertEq(burned, 1_000e18);
        assertEq(wethIn, 5 ether);
        assertEq(meme.balanceOf(DEAD), 1_000e18);
        assertEq(meme.balanceOf(address(distributor)), 0);
        assertEq(weth.balanceOf(PLATFORM_WALLET), expectedPlatform);
        assertEq(weth.balanceOf(creatorWallet), expectedCreator);
        assertEq(weth.balanceOf(address(distributor)), expectedRewardPool);
        assertEq(distributor.totalBurned(), 1_000e18);
    }

    function test_claimAndBurn_noopWhenNothingOwed() public {
        vm.prank(stranger);
        (uint256 burned, uint256 wethIn) = distributor.claimAndBurn();
        assertEq(burned, 0);
        assertEq(wethIn, 0);
        assertEq(meme.balanceOf(DEAD), 0);
    }

    function test_claimAndBurn_revertsWhenPaused() public {
        vm.prank(owner);
        distributor.setPaused(true);
        vm.expectRevert(BankpadDistributor.Paused.selector);
        distributor.claimAndBurn();
    }

    /*//////////////////////////////////////////////////////////////////////////
                                BUY REWARDS
    //////////////////////////////////////////////////////////////////////////*/

    function _fundWeth(uint256 amount) internal {
        vm.deal(address(this), amount);
        weth.deposit{value: amount}();
        weth.transfer(address(distributor), amount);
    }

    function test_buyRewards_swapsWethToReward() public {
        _fundWeth(2 ether);
        // Router keeps rate in bps against the raw uint amount, so stock it
        // with enough reward-token units to cover 1e18-scale outputs even
        // though the reward token is 6 decimals. We're only exercising the
        // plumbing (approvals, balance accounting, slippage guard).
        reward.mint(address(router), 10 ether);
        router.setRate(9_000); // 0.9x

        vm.prank(operator);
        uint256 out = distributor.buyRewards(1 ether, (1 ether * 9_000) / 10_000, 3_000);
        assertEq(out, (1 ether * 9_000) / 10_000);
        assertEq(weth.balanceOf(address(distributor)), 1 ether); // half left
    }

    function test_buyRewards_slippageRevert() public {
        _fundWeth(1 ether);
        reward.mint(address(router), 10 ether);
        router.setRate(5_000); // 0.5x
        // Caller asks for 0.9 out; router pays 0.5. Slippage guard must fire.
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(
                BankpadDistributor.SlippageExceeded.selector,
                (1 ether * 5_000) / 10_000,
                (1 ether * 9_000) / 10_000
            )
        );
        distributor.buyRewards(1 ether, (1 ether * 9_000) / 10_000, 3_000);
    }

    function test_buyRewards_rejectsNonOperator() public {
        _fundWeth(1 ether);
        vm.prank(stranger);
        vm.expectRevert(BankpadDistributor.NotOperatorOrStale.selector);
        distributor.buyRewards(1 ether, 0, 3_000);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                DISTRIBUTE
    //////////////////////////////////////////////////////////////////////////*/

    function _seedReward(uint256 amount) internal {
        reward.mint(address(distributor), amount);
    }

    function test_distribute_proRataAcrossEligibleHolders() public {
        _seedReward(1_000e6); // 1000 USDG
        address[] memory holders = new address[](2);
        holders[0] = alice; // 40M meme
        holders[1] = bob; // 10M meme

        vm.prank(operator);
        distributor.distribute(holders);

        // Alice/Bob balance ratio 4:1. Rewards split 4:1 too.
        assertEq(reward.balanceOf(alice), 800e6);
        assertEq(reward.balanceOf(bob), 200e6);
        assertEq(distributor.totalDistributed(), 1_000e6);
        assertEq(distributor.lastDistribution(), block.timestamp);
    }

    function test_distribute_rejectsPoolLocker() public {
        _seedReward(100e6);
        address[] memory holders = new address[](1);
        holders[0] = pool;
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(BankpadDistributor.IneligibleRecipient.selector, pool)
        );
        distributor.distribute(holders);

        holders[0] = locker;
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(BankpadDistributor.IneligibleRecipient.selector, locker)
        );
        distributor.distribute(holders);
    }

    function test_distribute_rejectsWhale() public {
        _seedReward(100e6);
        address[] memory holders = new address[](1);
        holders[0] = whale; // 5% of supply, above 4% cap
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(BankpadDistributor.IneligibleRecipient.selector, whale)
        );
        distributor.distribute(holders);
    }

    function test_distribute_rejectsZeroBalanceEntry() public {
        _seedReward(100e6);
        address[] memory holders = new address[](2);
        holders[0] = alice;
        holders[1] = stranger; // zero balance
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(BankpadDistributor.IneligibleRecipient.selector, stranger)
        );
        distributor.distribute(holders);
    }

    function test_distribute_cooldown() public {
        _seedReward(100e6);
        address[] memory holders = new address[](1);
        holders[0] = alice;

        vm.prank(operator);
        distributor.distribute(holders);

        // Try to distribute again immediately.
        _seedReward(50e6);
        vm.prank(operator);
        vm.expectRevert(BankpadDistributor.CooldownActive.selector);
        distributor.distribute(holders);

        // After the cooldown, it works.
        vm.warp(block.timestamp + distributor.DISTRIBUTION_COOLDOWN());
        vm.prank(operator);
        distributor.distribute(holders);
    }

    function test_distribute_strangerCanRunAfterStaleWindow() public {
        _seedReward(100e6);
        address[] memory holders = new address[](1);
        holders[0] = alice;

        vm.prank(operator);
        distributor.distribute(holders);

        // Stranger cannot run inside the operator's window.
        _seedReward(100e6);
        vm.warp(block.timestamp + distributor.DISTRIBUTION_COOLDOWN());
        vm.prank(stranger);
        vm.expectRevert(BankpadDistributor.NotOperatorOrStale.selector);
        distributor.distribute(holders);

        // After 24h without an operator call, stranger takes over.
        vm.warp(block.timestamp + distributor.OPERATOR_STALE_WINDOW());
        vm.prank(stranger);
        distributor.distribute(holders);
    }

    function test_distribute_emptyReverts() public {
        _seedReward(100e6);
        address[] memory holders = new address[](0);
        vm.prank(operator);
        vm.expectRevert(BankpadDistributor.EmptyRecipients.selector);
        distributor.distribute(holders);
    }

    function test_distribute_noRewardsReverts() public {
        address[] memory holders = new address[](1);
        holders[0] = alice;
        vm.prank(operator);
        vm.expectRevert(BankpadDistributor.InsufficientReward.selector);
        distributor.distribute(holders);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    OWNER
    //////////////////////////////////////////////////////////////////////////*/

    function test_setOperator_ownerOnly() public {
        address next = makeAddr("nextOp");

        vm.prank(stranger);
        vm.expectRevert();
        distributor.setOperator(next);

        vm.prank(owner);
        distributor.setOperator(next);
        assertEq(distributor.operator(), next);
    }

    function test_setPaused_ownerOnly() public {
        vm.prank(stranger);
        vm.expectRevert();
        distributor.setPaused(true);

        vm.prank(owner);
        distributor.setPaused(true);
        assertTrue(distributor.paused());
    }

    /*//////////////////////////////////////////////////////////////////////////
                                ETH FALLBACK
    //////////////////////////////////////////////////////////////////////////*/

    function test_receive_wrapsEthAsWeth() public {
        vm.deal(alice, 3 ether);
        vm.prank(alice);
        (bool ok,) = payable(address(distributor)).call{value: 3 ether}("");
        require(ok, "transfer failed");
        assertEq(weth.balanceOf(address(distributor)), 3 ether);
    }
}
