# Bankpad

Bankpad is a memecoin launchpad on Robinhood Chain (id 4663) where every
token pays its holders rewards in a real country currency (USDG first,
more as their pools clear the depth floor). It's the [Ponks Family](https://ponsfamily.pro/how/)
model with the reward asset swapped from tokenized stocks to
fiat-backed currency tokens.

**Live:** https://bankpad.netlify.app

## How it works

1. Creator picks a national currency, mints their coin through the
   official [Pons V1 factory](https://github.com/ponsdotdev/ponsfamily)
   (`0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB`). Fixed 1B supply, LP
   locked forever, launch fee ≈ 0.0005 ETH.
2. The launch's fee wallet is either the creator's own EOA
   (self-custody mode) or a `BankpadDistributor` instance (automated
   rewards mode). The distributor has no admin key that can redirect
   funds — every value exit is bounded (dead address, fixed swap
   route to the reward token, or eligible holders).
3. Every ~60s the backend calls `claimAndBurn()`: sweeps V3 trading
   fees, burns the memecoin portion, parks WETH.
4. Every ~10min the backend calls `buyRewards()`: swaps parked WETH
   into the launch's reward token (e.g. USDG) on the deepest Uniswap
   V3 pool, with slippage and pool-depth checks.
5. Every ~10min the backend calls `distribute()`: pro-rata pushes
   the reward token to every eligible holder (skips pool, locker,
   dead, distributor, wallets > 4% supply).

Holders never claim; the distributor pushes. If the automation
operator ever goes dark, anyone can call `distribute()` after a 24 h
stale window.

## Repository layout

```
currency-bond-launch/
  src/                          Frontend (TanStack Start + React 19 + Vite)
    lib/
      chain/                    Robinhood Chain 4663 viem config
      registry/                 Reward-currency allowlist (USDG seeded)
      pons/                     Pons V1 factory + launcher + distributor +
                                 Uniswap V3 ABIs, and typed launch helpers
      wagmi/                    wagmi + RainbowKit setup, chain-locked
      api/                      Backend HTTP client (registerLaunch)
    components/site/
      wallet-button.tsx         RainbowKit-driven Connect wallet
      on-chain-stats.tsx        Live chain-read panel on token pages
      currency-globe.tsx        3D globe with flag-glow on hover
    routes/                     TanStack Start file routes
  contracts/                    Foundry project — BankpadDistributor
    src/BankpadDistributor.sol  The reward loop contract
    test/                       19 tests, all passing
    script/Deploy.s.sol         One-distributor-per-launch deployer
  backend/                      Fastify API + BullMQ workers
    prisma/schema.prisma        Launch, FeeClaim, CurrencyBuy, PayoutBatch,
                                 Payout, EncryptedKey
    src/
      config.ts                 zod-validated env at boot
      lib/crypto.ts             AES-256-GCM for at-rest key encryption
      chain/clients.ts          viem public + wallet clients
      pons/abis.ts              Launcher + BankpadDistributor ABIs
      pons/uniswap.ts           V3 pool + factory ABIs
      registry/                 Currency allowlist, pool-depth probe
      jobs/                     claim-fees (60s), buy-currency (10min),
                                 distribute (10min)
      server/                   Fastify routes: /health, /currencies,
                                 /launches
    docker-compose.yml          postgres + redis + api + worker
  SECURITY.md                   Threat model, invariants, key handling
  docs/architecture.md          Full plan mapped to Ponks
```

## Deployed addresses (Robinhood Chain, id 4663)

| | Address |
|---|---|
| Pons V1 factory | `0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB` |
| Pons V2 factory (not used) | `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` |
| WETH | `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73` |
| USDG (reward currency 1) | `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` (6 decimals) |
| Uniswap V3 factory | `0x1f7d7550B1b028f7571E69A784071F0205FD2EfA` |
| Uniswap V3 NFPM | `0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3` |
| Uniswap V3 SwapRouter02 | `0xcaf681a66D020601342297493863e78c959E5cB2` |
| Uniswap V3 UniversalRouter | `0x8876789976DEcBFcbBBE364623c63652dB8c0904` |
| Permit2 (canonical) | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |
| Multicall3 (canonical) | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| Explorer | https://robinhoodchain.blockscout.com |

## Frontend

```sh
bun install
bun run dev
```

Env: copy `.env` to fill in Supabase, and optionally set
`VITE_BANKPAD_API_URL` to point at a running backend and
`VITE_WALLETCONNECT_PROJECT_ID` for WalletConnect support.

Build for Netlify (default): `NITRO_PRESET=netlify bun run build`.
Build for Vercel: `NITRO_PRESET=vercel bun run build`.

## Contracts

Foundry project in `contracts/`. See [contracts/README.md](contracts/README.md)
for the full runbook. Deploying a distributor for one launch:

```sh
cd contracts
forge install --no-git foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge test -vvv
# Then, with the env vars from contracts/README.md filled in:
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://rpc.mainnet.chain.robinhood.com --broadcast
```

Set the deployed distributor as the launched token's `feeWallet` and
the automation loop takes over.

## Backend

Fastify API + BullMQ workers, Docker-composed with Postgres + Redis.
See [backend/README.md](backend/README.md) for the runbook.

```sh
cd backend
cp .env.example .env       # fill in BANKPAD_MASTER_KEY (openssl rand -hex 32)
docker compose up -d --build
```

## Security

See [SECURITY.md](SECURITY.md) for the threat model. Two contracts to
audit if you're forking: `PonsLaunchFactory` (upstream, unchanged) and
`BankpadDistributor` (this repo). No admin keys can pull LP or
redirect fees to an arbitrary address; the automation operator is
bounded by the distributor's on-chain eligibility rules.
