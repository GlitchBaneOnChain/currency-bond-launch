# Bankpad — Security notes

Bankpad launches memecoins through the official Pons V1 factory on Robinhood
Chain (id 4663) and runs an off-chain automation engine that (a) claims V3
trading fees, (b) burns the meme-token portion, (c) market-buys the launch's
chosen reward currency (USDG by default), and (d) distributes the purchased
currency pro-rata to eligible holders. This document is the threat model.

## Trust boundaries

- **Uniswap V3 pool + Pons position locker.** Not owned by Bankpad. Liquidity
  is locked forever by the Pons `locker`. There is no admin key that can pull
  liquidity or redirect the underlying LP.
- **Fee wallet on the launched token.** Set at `launchToken()` time and
  configurable per launch. Two modes:
  1. *Distributor mode.* `feeWallet` is the `BankpadDistributor` contract.
     Holders never trust an EOA; the distributor's rules are on-chain.
  2. *Self-custody mode.* `feeWallet` is the creator's own EOA. The creator
     can opt into the reward loop by transferring fees to the distributor as
     they see fit. Bankpad never holds keys in this mode.
- **Automation engine.** Off-chain worker that calls the distributor. It can
  only trigger operations the distributor already permits (claim → burn →
  swap → distribute). It cannot redirect funds because the distributor's
  destinations are constants (dead address, allowlisted reward currency
  address, on-chain holder set).
- **Hot wallet (if any).** Only exists if the operator opts into fully-
  automated launches on the user's behalf. Encrypted at rest with AES-256-GCM
  (see below); funded with the exact ETH needed per launch plus a small buffer;
  never used for anything except calling the factory. Compromise costs the
  operator the buffer, not user funds.

## Distributor invariants

- No admin can change the reward currency after launch.
- No admin can withdraw the LP or the collected fees to an arbitrary address.
- Every distribution call:
  - Skips the Uniswap pool, the Pons locker, the dead address, the distributor
    itself, and any wallet holding > 4% of total supply.
  - Snapshots eligible holders in the same block it pays out.
  - Simulates first (`eth_call` / `estimateGas`); silently no-ops when zero
    value is available.
- Every currency buy:
  - Checks pool depth against a floor from the reward-currency registry
    (`minPoolDepthUsd`).
  - Enforces slippage (default 0.5%) and a max price-impact cap.
- Every state-mutating call is guarded by a reentrancy lock and uses SafeERC20.

## Key management

- Master key lives only in the operator's secrets manager (AWS Secrets
  Manager / GCP Secret Manager / 1Password Connect). Never in the repo,
  never in the DB.
- Encrypted-at-rest scheme: AES-256-GCM with a per-record 12-byte IV and the
  16-byte auth tag stored alongside the ciphertext. Rows carry a key version
  id so rotation is a re-encrypt migration, not a schema change.
- Structured logs never include the plaintext key, the IV, or the auth tag.
  They include the key version id and the wallet address only.

## Rate-limits and circuit breakers

- Per-token cooldown: fee-claim job runs at most every 60 s.
- Per-token cooldown: buy + distribute jobs run at most every 10 min.
- Global kill-switch env flag (`BANKPAD_PAUSE=1`) halts every scheduled job.
- Per-token pause flag in DB flips a token out of the loop without shipping
  a new build.
- Anomaly detector: if a single buy would move > 3% or spend > 25% of the
  reserve currency in one shot, the job aborts and pages the operator.

## API surface

- SIWE session cookies (if enabled): `httpOnly`, `secure`, `SameSite=Lax`,
  bound to the signing address, 24-hour TTL, rotated on every request.
- CSRF: mutations require a double-submitted token bound to the session.
- CORS: locked to the site's own origin + the local dev origin.
- Rate-limit: 60 req/min per IP + 300 req/min per session on write endpoints.
- Never accept a reward-currency address from the client; look it up in the
  registry by code, verify pool depth on-chain before publishing the launch.

## Threats we deliberately do not defend against

- MEV on the currency-buy leg beyond the slippage cap. Cost is real but
  bounded by the cap; documented in the launch UI.
- A malicious `feeWallet` in self-custody mode. Creators who set their own
  EOA as the fee wallet can withhold rewards; the UI shows a large "self-
  custody" badge on those launches so holders can price it in.

## Reporting

Security disclosures: security@bankpad.xyz (once the domain is up). Until
then, open a private GitHub Security Advisory on the repo.
