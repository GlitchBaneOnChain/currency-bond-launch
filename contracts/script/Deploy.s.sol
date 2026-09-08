// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {BankpadDistributor} from "../src/BankpadDistributor.sol";
import {INonfungiblePositionManager} from "../src/interfaces/INonfungiblePositionManager.sol";
import {IUniswapV3SwapRouter} from "../src/interfaces/IUniswapV3SwapRouter.sol";
import {IWETH} from "../src/interfaces/IWETH.sol";

/// @notice Deploy a `BankpadDistributor` for one launched token on Robinhood
/// Chain. Every parameter comes from env vars so this script can be run
/// verbatim by the automation engine after a fresh launch:
///
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url https://rpc.mainnet.chain.robinhood.com \
///     --broadcast --sender $DEPLOYER
///
/// Required env vars:
///   DEPLOYER_KEY         Private key of the deployer (an EOA the creator
///                        or automation engine controls).
///   BANKPAD_OWNER        Address that will own the deployed distributor.
///                        Set operator + pause. Renounce later if desired.
///   BANKPAD_OPERATOR     Automation engine hot wallet.
///   BANKPAD_TOKEN        Address of the launched Pons meme token.
///   BANKPAD_REWARD       Address of the reward currency ERC-20 (USDG etc).
///   BANKPAD_POOL         Uniswap V3 pool holding the token / WETH pair.
///   BANKPAD_LOCKER       Pons LP locker address for this launch.
///   BANKPAD_POSITION_ID  NFPM tokenId of the locked LP position.
///   BANKPAD_CREATOR      Wallet the creator's per-trade fee routes to.
///   BANKPAD_CREATOR_BPS  Creator fee in basis points, 0 to 500 (5%).
///
/// Optional (fall back to Robinhood Chain canonicals):
///   BANKPAD_WETH        default: 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73
///   BANKPAD_NFPM        no default; must be set once the canonical
///                       Uniswap V3 NFPM address on Robinhood Chain is
///                       confirmed.
///   BANKPAD_SWAPROUTER  no default; same as above.
contract Deploy is Script {
    // Robinhood Chain canonicals — the Uniswap V3 deployment for chain 4663
    // (see https://github.com/Uniswap/contracts/blob/main/deployments/4663.md).
    // Verified against blockscout before use.
    address constant DEFAULT_WETH = 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73;
    address constant DEFAULT_NFPM = 0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3;
    address constant DEFAULT_SWAP_ROUTER = 0xcaf681a66D020601342297493863e78c959E5cB2;

    function run() external returns (BankpadDistributor distributor) {
        address ownerAddr = vm.envAddress("BANKPAD_OWNER");
        address operatorAddr = vm.envAddress("BANKPAD_OPERATOR");
        address tokenAddr = vm.envAddress("BANKPAD_TOKEN");
        address rewardAddr = vm.envAddress("BANKPAD_REWARD");
        address poolAddr = vm.envAddress("BANKPAD_POOL");
        address lockerAddr = vm.envAddress("BANKPAD_LOCKER");
        uint256 posId = vm.envUint("BANKPAD_POSITION_ID");
        address wethAddr = vm.envOr("BANKPAD_WETH", DEFAULT_WETH);
        address nfpmAddr = vm.envOr("BANKPAD_NFPM", DEFAULT_NFPM);
        address swapRouterAddr = vm.envOr("BANKPAD_SWAPROUTER", DEFAULT_SWAP_ROUTER);
        address creatorAddr = vm.envAddress("BANKPAD_CREATOR");
        uint256 creatorBps = vm.envUint("BANKPAD_CREATOR_BPS");

        vm.startBroadcast(vm.envUint("DEPLOYER_KEY"));
        distributor = new BankpadDistributor(
            ownerAddr,
            operatorAddr,
            creatorAddr,
            creatorBps,
            IERC20(tokenAddr),
            IERC20(rewardAddr),
            IWETH(wethAddr),
            INonfungiblePositionManager(nfpmAddr),
            IUniswapV3SwapRouter(swapRouterAddr),
            poolAddr,
            lockerAddr,
            posId
        );
        vm.stopBroadcast();

        console2.log("BankpadDistributor deployed at:", address(distributor));
    }
}
