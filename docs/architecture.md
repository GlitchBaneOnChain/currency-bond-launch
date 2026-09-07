# Bankpad — Architecture

Ship plan for the Bankpad launchpad, mapped 1:1 to Pons/Ponks and diffed
where Bankpad differs.

## What changes vs Ponks

| | Ponks | Bankpad |
| --- | --- | --- |
| Reward asset | Tokenized stocks (NVDA, TSLA, …) | Country-currency tokens (USDG first; more currencies as depth appears) |
| Factory | Pons V1 / V2 | **Pons V1** ([why](../src/lib/pons/README.md)) |
| Chain | Robinhood Chain (4663) | Robinhood Chain (4663) |
| Launch supply | 1B, 18 decimals | 1B, 18 decimals |
| Launch fee | 0.0005 ETH + gas | 0.0005 ETH + gas |
| LP | Uniswap V3, locked forever | Uniswap V3, locked forever |
| Reward loop | claim → burn → buy stock → distribute | claim → burn → buy currency → distribute |
| Eligibility | Skip pool/locker/dead/>4% | Same |
| Distribution | Pushed to holders (no claim) | Same |

Everything else — supply mechanics, LP lock, holder eligibility rules, push
distribution model, dev-buy option, launch UI flow — matches Ponks. The
diff is the reward asset and the currency registry that gates it.

## Repository layout (target)

```
currency-bond-launch/
  src/                          # Frontend (TanStack Start + React 19)
    lib/
      chain/                    # Robinhood Chain 4663 config + viem clients
      registry/                 # Reward currency allowlist (USDG, …)
      pons/                     # Factory ABIs + launch helper
      market.ts                 # Existing UI-side models (kept)
    components/
    routes/
  contracts/                    # Foundry project (added next slice)
    src/
      BankpadDistributor.sol       # per-token claim + burn + swap + distribute
      SupportedCurrencyRegistry.sol # on-chain twin of the frontend allowlist
    script/
    test/
    foundry.toml
  backend/                      # Automation engine (added next slice)
    src/
      chain/                    # Shared viem clients, RPC config
      pons/                     # Factory + distributor clients
      jobs/                     # fee-claim (60s), buy-currency (10min), distribute (10min)
      registry/                 # currency depth verifier
      db/                       # Prisma models: launches, holders, payouts, keys
      lib/                      # AES-256-GCM crypto, simulate-before-send, structured logs
      server.ts                 # HTTP API consumed by the frontend
    prisma/
      schema.prisma
    docker-compose.yml
    Dockerfile
  SECURITY.md
  docs/
    architecture.md             # This file
```

## The reward loop (fully specced)

1. **Fee claim (~60 s).** For each active launch:
   - Read `positions(tokenId).tokensOwed0/1`. Skip if both are zero.
   - Simulate `collect(...)` with the token's `feeWallet` as the recipient.
   - If gas cost < collected value in ETH terms (with a safety margin), send.
   - Persist the resulting `(claimed_amount, tx_hash)` to `payouts_raw`.
2. **Burn.** The meme-token side of the collected amount is transferred to
   `0x…dEaD` in the same transaction as the collect (the distributor exposes
   a `collectAndSweep` entrypoint that pipes it through in one atomic tx).
3. **Currency buy (~10 min).** For each launch with accumulated WETH:
   - Read reserves on the WETH ↔ reward-currency Uniswap pool.
   - Check `pool_depth >= minPoolDepthUsd` from the reward-currency registry.
   - Simulate the swap with the configured slippage cap (default 0.5%) and
     max price-impact (default 3%). Abort and page if either fires.
   - Broadcast; persist `(bought_amount, price, tx_hash)` to `buys_raw`.
4. **Distribute (immediately after buy).**
   - Snapshot holders via the launched token's `Transfer` events since the
     last snapshot, apply the skip-list (pool, locker, dead, distributor,
     wallets > 4% supply).
   - Batch-transfer the purchased currency to eligible holders using
     Permit2 `transferFrom` in a multicall (or, if too many holders for one
     tx, deterministically chunked calls that all reference the same
     snapshot).
   - Persist `(holder, amount, tx_hash)` rows to `payouts` for the frontend
     to render as "dividend history".
5. **Publish.** The frontend reads `/api/tokens/:address` and shows total
   burned, total distributed, current eligible holder count, and the payout
   feed. All numbers are recomputed from `payouts` + on-chain reads so the
   UI never lies about a stalled worker.

## Failure model

- Every job is guarded by a Redis lock keyed on `(job_name, token_address)`
  so a restarted worker cannot double-collect.
- Every scheduled tick is idempotent: it reads live on-chain state, runs
  the check, and no-ops if there is nothing to do.
- Sends are always preceded by a simulation on the same block; failures are
  logged with a full input dump (no keys) and paged if they cross the
  circuit-breaker threshold.
- The DB is the source of truth for *history*; the chain is the source of
  truth for *state*. Nightly reconciliation re-reads `payouts` from
  `Transfer` logs and flags rows that drift.

## What ships in Slice 1 (this commit)

- Chain config, viem client factories, chain-switch prompt.
- Reward-currency registry (USDG only for now).
- Pons V1 factory ABI + typed `launchTokenTx` helper.
- Uniswap V3 NFPM ABI stub (address to be filled after we confirm the
  canonical Robinhood Chain deployment).
- SECURITY.md.
- This document.

## What ships next (Slice 2, in order)

1. Wire wagmi + RainbowKit into `src/routes/__root.tsx` and swap the
   navbar's "Connect wallet" button. Force chain 4663 on connect.
2. Rewrite `src/routes/launch.tsx` to call `launchTokenTx` after the user
   signs; move the current mock `launchToken` server fn to
   `/api/launches` that only records off-chain metadata.
3. Scaffold `contracts/` (Foundry) with `BankpadDistributor.sol` and its
   tests.
4. Scaffold `backend/` (BullMQ + Postgres + Redis) with the three jobs
   and the Prisma schema; ship a docker-compose for local runs.
5. Turn on the automation engine on a single testnet launch end-to-end.
