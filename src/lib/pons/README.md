# Pons integration

Bankpad launches tokens through the official Pons factory on Robinhood Chain.
The choice, once, at the top:

## V1 vs V2

- **V1** (`0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB`) — CREATE2 factory. On
  `launchToken()` it mints a fixed 1B-supply ERC-20, opens a one-sided Uniswap
  **V3** position with the full supply, and locks the position NFT with a
  configurable locker. The launched token exposes a `feeWallet` set by the
  deployer; V3 pool trading fees route to the collectable position and are
  swept by the automation engine via `nonfungiblePositionManager.collect()`.
- **V2** (`0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e`) — bonding curve into a
  graduated Uniswap **V4** pool with a singleton hook, quote-denominated fee
  escrow, creator tax and a five-year buyback vault.

**Bankpad ships on V1.** The reason is scope: V1's fee flow is a plain V3
position collect, so the reward loop (claim → burn meme → buy currency →
distribute pro-rata) lives entirely in an external actor. V2 bakes an escrow,
a creator tax and a buyback vault into the hook — those overlap with the
distributor we own and would force our automation to interleave with hook
callbacks. V1 also unlocks liquidity-from-block-one, which matches the "coin
that rewards holders starting from the first trade" promise.

If we later need a bonding-curve launch UX, we can register V2 as a second
factory in this directory without changing the distributor contract.

## Layout

- `factory-v1.ts` — factory address, `launchToken` typed args and the ABI
  fragment for the calls Bankpad makes.
- `launcher-token.ts` — the minimum ERC-20 + fee-wallet ABI for launched tokens.
- `events.ts` — `TokenLaunched` log parsing.

Full V1 ABI lives in `ponsdotdev/ponsfamily`'s `abi.json`; we import only the
fragments we call, so the bundle stays small and the surface area is auditable.
