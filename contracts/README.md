# Bankpad — Contracts

Solidity for the reward loop that turns a Pons V1 launch into a
"holders earn USDG" coin on Robinhood Chain. One contract:
[`BankpadDistributor`](src/BankpadDistributor.sol).

## What it does

Bankpad launches token X through the official Pons V1 factory. The launched
token exposes a `feeWallet`; when Bankpad's launch UI runs in "automated
mode" that fee wallet is a `BankpadDistributor` instance. The V3 trading
fees route to the distributor and the reward loop runs from there:

1. **`claimAndBurn()`** — permissionless. Sweeps the position's accrued
   fees via `NonfungiblePositionManager.collect()`, then sends every
   memecoin received to `0x…dEaD`. WETH is parked for the next step.
2. **`buyRewards(amountIn, minOut, poolFee)`** — operator (or anyone
   after a 24 h stale window). Swaps parked WETH into the launch's
   reward currency (USDG by default) on Uniswap V3. `minOut` bounds MEV.
3. **`distribute(address[] holders)`** — same permission gate. Pro-rata
   pushes the reward-currency balance to each `holders[i]` in proportion
   to `token.balanceOf(holders[i])`. Ineligible entries (pool, locker,
   dead, self, > 4% supply, zero balance) revert the whole call — the
   caller cannot silently pad the list to inflate a share.

There is no `withdraw`, no `sweep` and no admin key that can redirect
funds. The distributor's only exit paths for value are the burn address,
the fixed swap route to the reward token, and eligible holders. See
[SECURITY.md](../SECURITY.md) for the full trust model.

## Layout

```
contracts/
  foundry.toml
  remappings.txt
  src/
    BankpadDistributor.sol
    interfaces/
      INonfungiblePositionManager.sol
      IUniswapV3SwapRouter.sol
      IWETH.sol
  test/
    BankpadDistributor.t.sol
    mocks/
      MockERC20.sol
      MockWETH.sol
      MockNfpm.sol
      MockSwapRouter.sol
  script/
    Deploy.s.sol
```

## Setup

Install Foundry (`curl -L https://foundry.paradigm.xyz | bash`, then
`foundryup`), then from this directory:

```sh
forge install --no-git foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge build
forge test -vvv
```

## Deploy (one distributor per launch)

Once a launch is minted through the Pons factory and you know the
`tokenId` of its locked V3 position:

```sh
export DEPLOYER_KEY=0x…
export BANKPAD_OWNER=0x…          # creator wallet or timelock
export BANKPAD_OPERATOR=0x…       # automation engine hot wallet
export BANKPAD_TOKEN=0x…          # Pons-launched token address
export BANKPAD_REWARD=0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168 # USDG
export BANKPAD_POOL=0x…           # Uniswap V3 pool for token/WETH
export BANKPAD_LOCKER=0x…         # Pons locker address for this launch
export BANKPAD_POSITION_ID=…      # V3 NFT tokenId
export BANKPAD_NFPM=0x…           # V3 NonfungiblePositionManager
export BANKPAD_SWAPROUTER=0x…     # V3 SwapRouter
# BANKPAD_WETH falls back to Robinhood Chain WETH if unset.

forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://rpc.mainnet.chain.robinhood.com \
  --broadcast
```

The deployed address is what the launch UI should set as the token's
`feeWallet` in "automated mode". In "self-custody mode" (Slice 3's
default today) the creator's own wallet is the fee wallet; upgrading
to automated mode later is a single `feeWallet` update on the launched
token — nothing about this distributor cares about the transition.

## Tests

`forge test -vvv` covers, at minimum:

- constructor sets every immutable and rejects zero addresses
- `claimAndBurn` burns the meme portion, keeps WETH, no-ops on zero
- `buyRewards` swaps at the router, enforces the slippage floor, and
  clears its own approval
- `distribute` pays pro-rata, rejects pool / locker / whale / zero
  entries, enforces the 10-minute cooldown, opens up to anyone after
  the 24-hour operator-stale window
- pause halts every mutating entrypoint
- raw ETH sent to the contract wraps into WETH via `receive()`

## What's next

- Slice 5 (backend/) fills in the off-chain scheduler that calls these
  entrypoints on a timer.
- Once the canonical Uniswap V3 addresses on Robinhood Chain are
  confirmed, wire them into the deploy script as defaults so the
  operator only needs the per-launch env vars.
