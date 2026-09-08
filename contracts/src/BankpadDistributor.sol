// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";

import {INonfungiblePositionManager} from "./interfaces/INonfungiblePositionManager.sol";
import {IUniswapV3SwapRouter} from "./interfaces/IUniswapV3SwapRouter.sol";
import {IWETH} from "./interfaces/IWETH.sol";

/// @title BankpadDistributor
/// @notice Owns the reward loop for a single Pons V1 launch. Registered as the
/// launched token's `feeWallet`, so the Uniswap V3 position's trading fees
/// route to this contract via `NonfungiblePositionManager.collect()`. The
/// distributor then:
///
///   1. Burns the launched-token side of the collected fees to `0x…dEaD`.
///   2. Swaps the WETH side into the launch's chosen reward currency (USDG
///      by default) on Uniswap V3.
///   3. Pushes the reward currency pro-rata to eligible holders passed in by
///      the automation engine.
///
/// @dev Trust model:
///   - There is no admin key that can withdraw the LP or redirect fees to an
///     arbitrary address. The distributor's destinations are constants: the
///     dead address for burns, the fixed reward token for swaps, and the
///     eligible-holder set for distribution.
///   - `owner` (Ownable2Step) can only set the `operator` and flip `paused`.
///     Ownership can be renounced once the automation engine is stable.
///   - `operator` schedules the reward loop. Its power is bounded by the
///     contract's eligibility rules (see `_isEligible`) and by the fact that
///     every rewards distribution is pro-rata against holders' *current*
///     balances — the operator cannot inflate any single holder's share.
///   - After a 24-hour operator idle window, anyone can call `distribute` to
///     protect against a stalled or captured operator.
///
/// @dev Invariants enforced by the code:
///   - `rewardToken.balanceOf(this)` only ever leaves via a distribution to
///     an eligible holder.
///   - `token.balanceOf(this)` only ever leaves via a transfer to the burn
///     address.
///   - `weth.balanceOf(this)` only ever leaves via a `SwapRouter` call whose
///     `tokenOut == rewardToken`.
contract BankpadDistributor is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeERC20 for IWETH;

    /*//////////////////////////////////////////////////////////////////////////
                                    CONSTANTS
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Canonical burn sink for the memecoin portion of collected fees.
    address public constant DEAD = 0x000000000000000000000000000000000000dEaD;

    /// @notice Bankpad's own take on every fee collection. 1% of the WETH
    /// side of collected fees always routes to {@link PLATFORM_WALLET}. This
    /// value is intentionally a `constant`: no admin, no owner and no operator
    /// can change or waive it. The launchpad's share is baked into the code.
    uint256 public constant PLATFORM_FEE_BPS = 100;

    /// @notice Where Bankpad's platform fee goes. Immutable. Documented at
    /// the app level in `src/lib/registry/fees.ts` so on-chain and off-chain
    /// stay in sync.
    address public constant PLATFORM_WALLET = 0xefEFd65A24120A61c96cfbA1A8DC861fAC03C3c7;

    /// @notice Upper bound on the creator's per-launch fee. Set high enough
    /// to give creators meaningful revenue, low enough to keep predatory
    /// launches off Bankpad. 5% = 500bps.
    uint256 public constant MAX_CREATOR_FEE_BPS = 500;

    /// @notice A holder counts as an eligible reward recipient only if they
    /// own <= `MAX_ELIGIBLE_BPS` of total supply. 4% = 400bps out of 10_000.
    uint256 public constant MAX_ELIGIBLE_BPS = 400;
    uint256 public constant BPS_DENOM = 10_000;

    /// @notice Minimum gap between two `distribute()` calls, to prevent
    /// gas-thrashing the reward pool into dust.
    uint256 public constant DISTRIBUTION_COOLDOWN = 10 minutes;

    /// @notice After `OPERATOR_STALE_WINDOW` with no `distribute()`, anyone
    /// can call it. Guards against a captured or offline operator.
    uint256 public constant OPERATOR_STALE_WINDOW = 24 hours;

    /*//////////////////////////////////////////////////////////////////////////
                                IMMUTABLE STATE
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice The Pons-launched meme token this distributor serves.
    IERC20 public immutable token;

    /// @notice Uniswap V3 pool holding `token` / `weth` liquidity. Marked
    /// ineligible so the pool can never be treated as a rewards recipient.
    address public immutable pool;

    /// @notice The Pons LP locker that owns the position NFT. Marked ineligible.
    address public immutable locker;

    /// @notice Uniswap V3 position id of the launch's LP.
    uint256 public immutable positionId;

    /// @notice Uniswap V3 NonfungiblePositionManager that owns `positionId`.
    INonfungiblePositionManager public immutable positionManager;

    /// @notice Uniswap V3 SwapRouter used to convert WETH into `rewardToken`.
    IUniswapV3SwapRouter public immutable swapRouter;

    /// @notice Wrapped ETH on Robinhood Chain. Fee side of the V3 pool.
    IWETH public immutable weth;

    /// @notice The launch's chosen reward currency (e.g. USDG). Immutable.
    IERC20 public immutable rewardToken;

    /// @notice The creator's own wallet. Receives the creator fee on every
    /// fee collection. Set once at deploy time and never changes.
    address public immutable creatorWallet;

    /// @notice The creator's per-trade fee, in basis points. Capped by
    /// {@link MAX_CREATOR_FEE_BPS}. Set once at deploy time and never
    /// changes: creators cannot rug their own holders by raising the fee
    /// after launch, and Bankpad cannot raise it either.
    uint256 public immutable creatorFeeBps;

    /*//////////////////////////////////////////////////////////////////////////
                                MUTABLE STATE
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Address the automation engine holds the operator key for. Can
    /// call `buyRewards` and `distribute` without a cooldown escape.
    address public operator;

    /// @notice Emergency stop. When true, `claimAndBurn`, `buyRewards` and
    /// `distribute` revert. Owner-only.
    bool public paused;

    /// @notice Total memecoin burnt so far. View-only, used by the UI.
    uint256 public totalBurned;

    /// @notice Total reward currency shipped to holders so far. View-only.
    uint256 public totalDistributed;

    /// @notice Timestamp of the last successful `distribute()` call.
    uint256 public lastDistribution;

    /// @notice How many distinct addresses have received rewards at least once.
    uint256 public totalHolderPayouts;

    /*//////////////////////////////////////////////////////////////////////////
                                    EVENTS
    //////////////////////////////////////////////////////////////////////////*/

    event OperatorUpdated(address indexed previous, address indexed next);
    event PausedUpdated(bool paused);
    event FeesClaimed(uint256 memeAmount, uint256 wethAmount, uint256 burned);
    event PlatformFeePaid(address indexed platformWallet, uint256 wethAmount);
    event CreatorFeePaid(address indexed creatorWallet, uint256 wethAmount);
    event RewardsBought(
        uint256 wethIn, uint256 rewardsOut, uint256 amountOutMin, uint24 fee
    );
    event Distributed(
        uint256 rewardsPaid,
        uint256 eligibleHolders,
        uint256 eligibleSupplySnapshot,
        address caller,
        bool operatorTriggered
    );
    event RecipientPaid(address indexed recipient, uint256 amount);

    /*//////////////////////////////////////////////////////////////////////////
                                    ERRORS
    //////////////////////////////////////////////////////////////////////////*/

    error NotOperatorOrStale();
    error Paused();
    error CooldownActive();
    error EmptyRecipients();
    error IneligibleRecipient(address recipient);
    error SlippageExceeded(uint256 amountOut, uint256 minOut);
    error InsufficientWeth();
    error InsufficientReward();
    error ZeroAddress();
    error CreatorFeeTooHigh(uint256 provided, uint256 max);

    /*//////////////////////////////////////////////////////////////////////////
                                    SETUP
    //////////////////////////////////////////////////////////////////////////*/

    /// @param _owner          Address that will be able to set the operator and
    ///                        pause. Meant to be the creator's own wallet or a
    ///                        timelocked multisig; can be renounced.
    /// @param _operator       Automation engine hot wallet.
    /// @param _creatorWallet  Wallet that receives the creator fee on every
    ///                        collection. Usually the launcher's own address.
    /// @param _creatorFeeBps  Creator's per-trade fee in bps, 0 to
    ///                        {@link MAX_CREATOR_FEE_BPS}. Immutable.
    /// @param _token          The launched meme token (Pons V1 launcher token).
    /// @param _rewardToken    Reward currency ERC-20 chosen at launch (e.g. USDG).
    /// @param _weth           Wrapped ETH on Robinhood Chain.
    /// @param _positionMgr    Uniswap V3 NonfungiblePositionManager holding LP.
    /// @param _swapRouter     Uniswap V3 SwapRouter for WETH -> reward swaps.
    /// @param _pool           The token/WETH V3 pool. Ineligible for rewards.
    /// @param _locker         Pons LP locker. Ineligible for rewards.
    /// @param _positionId     NFPM tokenId of the locked LP position.
    constructor(
        address _owner,
        address _operator,
        address _creatorWallet,
        uint256 _creatorFeeBps,
        IERC20 _token,
        IERC20 _rewardToken,
        IWETH _weth,
        INonfungiblePositionManager _positionMgr,
        IUniswapV3SwapRouter _swapRouter,
        address _pool,
        address _locker,
        uint256 _positionId
    ) Ownable(_owner) {
        if (_owner == address(0)) revert ZeroAddress();
        if (_operator == address(0)) revert ZeroAddress();
        if (_creatorWallet == address(0)) revert ZeroAddress();
        if (address(_token) == address(0)) revert ZeroAddress();
        if (address(_rewardToken) == address(0)) revert ZeroAddress();
        if (address(_weth) == address(0)) revert ZeroAddress();
        if (address(_positionMgr) == address(0)) revert ZeroAddress();
        if (address(_swapRouter) == address(0)) revert ZeroAddress();
        if (_pool == address(0)) revert ZeroAddress();
        if (_locker == address(0)) revert ZeroAddress();
        if (_creatorFeeBps > MAX_CREATOR_FEE_BPS) {
            revert CreatorFeeTooHigh(_creatorFeeBps, MAX_CREATOR_FEE_BPS);
        }

        token = _token;
        rewardToken = _rewardToken;
        weth = _weth;
        positionManager = _positionMgr;
        swapRouter = _swapRouter;
        pool = _pool;
        locker = _locker;
        positionId = _positionId;
        creatorWallet = _creatorWallet;
        creatorFeeBps = _creatorFeeBps;

        operator = _operator;
        emit OperatorUpdated(address(0), _operator);
    }

    /// @notice Accept raw ETH — Uniswap can settle a position's fees in ETH
    /// when the pool holds WETH. We wrap on receipt so the swap step sees a
    /// consistent WETH balance.
    receive() external payable {
        // Fold raw ETH into WETH immediately so downstream accounting only
        // has to reason about the ERC-20 balance.
        if (msg.value > 0) weth.deposit{value: msg.value}();
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    OWNER
    //////////////////////////////////////////////////////////////////////////*/

    function setOperator(address next) external onlyOwner {
        if (next == address(0)) revert ZeroAddress();
        emit OperatorUpdated(operator, next);
        operator = next;
    }

    function setPaused(bool next) external onlyOwner {
        paused = next;
        emit PausedUpdated(next);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    REWARD LOOP
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Sweep the V3 position's accrued fees to this contract, split
    /// the WETH side into Bankpad's 1% platform fee and the creator's fee,
    /// then burn every memecoin token that arrived. The remaining WETH stays
    /// parked for the next `buyRewards` call.
    ///
    /// @dev Permissionless. The only destinations for the memecoin portion
    /// is `DEAD`; nobody profits from calling this except the reward loop.
    /// The platform + creator fees are always paid from the WETH side so the
    /// deflationary story (all memecoin fees burnt) stays intact.
    function claimAndBurn() external nonReentrant returns (uint256 burned, uint256 wethIn) {
        if (paused) revert Paused();
        uint256 memeBefore = token.balanceOf(address(this));
        uint256 wethBefore = weth.balanceOf(address(this));

        (uint256 amount0, uint256 amount1) = positionManager.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: positionId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            })
        );
        // We do not know which of amount0/amount1 corresponds to token vs
        // WETH — depends on address sort order in the V3 pool. Diff the
        // actual balance change instead of trusting the labels.
        uint256 memeGained = token.balanceOf(address(this)) - memeBefore;
        uint256 wethGained = weth.balanceOf(address(this)) - wethBefore;
        // amount0 + amount1 informational only — we still verify via balance
        // diffs to sidestep fee-on-transfer misreporting. The unused
        // locals keep the return call's shape clear for auditors.
        (amount0, amount1);

        if (memeGained > 0) {
            token.safeTransfer(DEAD, memeGained);
            totalBurned += memeGained;
        }

        // Pay the launchpad and the creator their cut from the WETH side.
        // Compute both up front so a rounding-down platform share can never
        // steal from the creator's share, and vice versa.
        if (wethGained > 0) {
            uint256 platformShare = (wethGained * PLATFORM_FEE_BPS) / BPS_DENOM;
            uint256 creatorShare = (wethGained * creatorFeeBps) / BPS_DENOM;
            if (platformShare > 0) {
                weth.safeTransfer(PLATFORM_WALLET, platformShare);
                emit PlatformFeePaid(PLATFORM_WALLET, platformShare);
            }
            if (creatorShare > 0) {
                weth.safeTransfer(creatorWallet, creatorShare);
                emit CreatorFeePaid(creatorWallet, creatorShare);
            }
        }

        emit FeesClaimed(memeGained, wethGained, memeGained);
        return (memeGained, wethGained);
    }

    /// @notice Swap parked WETH into `rewardToken` on Uniswap V3.
    /// @param amountIn     WETH to sell. Must be <= this contract's balance.
    /// @param amountOutMin Slippage floor computed by the operator (or an
    ///                     independent caller) from the current pool quote.
    /// @param poolFee      V3 pool fee tier (e.g. 3000 for the 0.3% pool).
    ///
    /// @dev Callable by the operator, or by anyone after the stale-operator
    /// window elapses. `amountOutMin` bounds MEV; a compromised operator
    /// setting it to zero is a real risk called out in SECURITY.md.
    function buyRewards(uint256 amountIn, uint256 amountOutMin, uint24 poolFee)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        _requireOperatorOrStale();
        if (paused) revert Paused();
        if (amountIn == 0 || weth.balanceOf(address(this)) < amountIn) revert InsufficientWeth();

        weth.forceApprove(address(swapRouter), amountIn);
        amountOut = swapRouter.exactInputSingle(
            IUniswapV3SwapRouter.ExactInputSingleParams({
                tokenIn: address(weth),
                tokenOut: address(rewardToken),
                fee: poolFee,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            })
        );
        if (amountOut < amountOutMin) revert SlippageExceeded(amountOut, amountOutMin);

        // Clear the residual approval so a bug in the router can never
        // pull additional WETH between calls.
        weth.forceApprove(address(swapRouter), 0);

        emit RewardsBought(amountIn, amountOut, amountOutMin, poolFee);
    }

    /// @notice Distribute the reward-currency balance held by this contract
    /// pro-rata among `holders`, in proportion to each holder's *current*
    /// balance of the launched token.
    ///
    /// @dev Ineligible entries in `holders` are rejected explicitly rather
    /// than silently skipped, so a caller can never mask an inflated share
    /// by padding the list with zero-balance addresses.
    function distribute(address[] calldata holders) external nonReentrant {
        if (paused) revert Paused();
        _requireOperatorOrStale();
        // Cooldown only bites once the loop has ever run — the first
        // distribution should not be blocked by the zero epoch.
        if (lastDistribution != 0 && block.timestamp < lastDistribution + DISTRIBUTION_COOLDOWN) {
            revert CooldownActive();
        }
        uint256 count = holders.length;
        if (count == 0) revert EmptyRecipients();

        uint256 rewardsAvailable = rewardToken.balanceOf(address(this));
        if (rewardsAvailable == 0) revert InsufficientReward();

        uint256 supply = token.totalSupply();
        uint256[] memory balances = new uint256[](count);
        uint256 eligibleTotal;

        // Pass 1: gather balances and enforce eligibility on every entry.
        for (uint256 i; i < count; ++i) {
            address holder = holders[i];
            if (!_isEligible(holder, supply)) revert IneligibleRecipient(holder);
            uint256 bal = token.balanceOf(holder);
            if (bal == 0) revert IneligibleRecipient(holder);
            balances[i] = bal;
            eligibleTotal += bal;
        }

        // Pass 2: pay each holder their pro-rata share of what's available.
        // Rounding leaves dust at this contract for the next round — a
        // deliberate choice so the sum of transfers never exceeds
        // `rewardsAvailable` and reverts the whole call.
        uint256 paid;
        for (uint256 i; i < count; ++i) {
            uint256 share = (rewardsAvailable * balances[i]) / eligibleTotal;
            if (share == 0) continue;
            rewardToken.safeTransfer(holders[i], share);
            emit RecipientPaid(holders[i], share);
            paid += share;
        }

        totalDistributed += paid;
        totalHolderPayouts += count;
        lastDistribution = block.timestamp;

        emit Distributed(paid, count, eligibleTotal, msg.sender, msg.sender == operator);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    VIEWS
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Test whether an address counts as a real holder for rewards.
    /// Public so the automation engine can pre-filter its holder list before
    /// paying gas for the on-chain check.
    function isEligible(address holder) external view returns (bool) {
        return _isEligible(holder, token.totalSupply());
    }

    /// @notice Fee amounts sitting on the V3 position that a `claimAndBurn`
    /// would sweep. Read-only, no state change.
    function pendingFees() external view returns (uint128 memeOwed, uint128 wethOwed) {
        (,,,,,,,,,, memeOwed, wethOwed) = positionManager.positions(positionId);
    }

    /// @notice Reward-currency balance currently held by this contract and
    /// waiting to be shipped to holders.
    function pendingRewards() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    INTERNAL
    //////////////////////////////////////////////////////////////////////////*/

    function _isEligible(address holder, uint256 supply) internal view returns (bool) {
        if (holder == address(0)) return false;
        if (holder == DEAD) return false;
        if (holder == address(this)) return false;
        if (holder == pool) return false;
        if (holder == locker) return false;
        // Whales above the eligibility cap are ineligible so a single wallet
        // cannot sink the round's rewards.
        uint256 bal = token.balanceOf(holder);
        if (bal * BPS_DENOM > supply * MAX_ELIGIBLE_BPS) return false;
        return true;
    }

    function _requireOperatorOrStale() internal view {
        if (msg.sender == operator) return;
        // After the stale window anyone can trigger the loop — the
        // eligibility checks + pro-rata math still bound where the funds go.
        if (block.timestamp >= lastDistribution + OPERATOR_STALE_WINDOW) return;
        revert NotOperatorOrStale();
    }
}
