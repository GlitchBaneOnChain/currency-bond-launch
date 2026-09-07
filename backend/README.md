# Bankpad — Backend

Automation engine for Bankpad launches on Robinhood Chain. Two processes:

- **api** — Fastify HTTP server the frontend calls to register a launch
  and read its metadata. `GET /health`, `GET /currencies`,
  `GET /launches/:address`, `POST /launches/register`.
- **worker** — BullMQ workers that run the reward loop for every
  registered launch: claim fees (60 s), buy the reward currency (10 min),
  distribute pro-rata to eligible holders (10 min).

Postgres is the source of truth for history (launches, payouts, keys);
the chain is the source of truth for state (balances, LP, current fee
accrual). Every mutating job records what it did so nightly
reconciliation can cross-check against on-chain events.

## Layout

```
backend/
  Dockerfile
  docker-compose.yml         # postgres + redis + api + worker
  package.json
  tsconfig.json
  .env.example
  prisma/
    schema.prisma            # Launch, FeeClaim, CurrencyBuy, PayoutBatch,
                             #   Payout, EncryptedKey
  src/
    config.ts                # zod-validated env at boot
    logger.ts                # pino with a redaction list
    db.ts                    # prisma client
    chain/clients.ts         # viem public + wallet clients (Robinhood 4663)
    lib/
      crypto.ts              # AES-256-GCM at-rest encryption for keys
      operator.ts            # decrypt-and-return an operator wallet client
    pons/abis.ts             # launcher-token + BankpadDistributor ABIs
    registry/currencies.ts   # reward-currency allowlist (mirrors the frontend)
    jobs/
      queue.ts               # BullMQ queues, workers, repeatable helpers
      claim-fees.ts          # 60s job
      buy-currency.ts        # 10min job
      distribute.ts          # 10min job
    server/
      index.ts               # Fastify boot
      routes/
        health.ts
        currencies.ts
        launches.ts          # POST /launches/register, GET /launches/:address
    workers/index.ts         # worker process entrypoint
    index.ts                 # api process entrypoint
```

## Run it locally

```sh
cp .env.example .env
# Fill in BANKPAD_MASTER_KEY (openssl rand -hex 32) and, once the
# Uniswap V3 addresses on Robinhood Chain are confirmed, the three
# UNISWAP_V3_* env vars.

# Boot postgres + redis:
docker compose up -d postgres redis

# Install deps + generate the Prisma client + run migrations:
npm install
npm run prisma:generate
npm run prisma:migrate

# Terminal 1: api
npm run dev

# Terminal 2: workers
npm run worker
```

`GET http://localhost:8080/health` should return `{ok:true,...}`.

## Ship it

```sh
docker compose up -d --build
```

`docker-compose.yml` boots the full stack (postgres + redis + api +
worker). The api container listens on 8080; put a reverse proxy in
front for TLS.

### Secrets

- `BANKPAD_MASTER_KEY` — 32 hex bytes. Only place the automation-
  operator private key can decrypt. Rotate by re-encrypting the
  `encrypted_key` table with a new master and bumping
  `BANKPAD_MASTER_KEY_VERSION`.
- Never commit `.env`. Structured logs redact the master key + any
  `ciphertext`/`iv`/`authTag` fields.

## What's in this slice (5) vs next (5b)

Slice 5 ships the shell + the reward-loop scaffolding: queues, workers,
API, DB schema, encryption, chain clients, ABIs, per-launch scheduling.
The three jobs simulate the on-chain call and log what they *would*
broadcast; the actual `writeContract` calls are gated behind
`loadOperatorWallet` — swap the log line for the write once the
operator wallet is funded and the encrypted key row exists.

Slice 5b turns those log lines into broadcasts, adds a proper
`Transfer`-event indexer so the distribute job stops scanning from
block zero, wires pool-depth and slippage math against a real pool
quote, and adds vitest coverage for the crypto/queue paths.

## Runbook

- **Pause everything:** set `BANKPAD_PAUSE=1` in the env and restart.
- **Pause one launch:** `UPDATE launches SET paused = true WHERE address = '0x…';`
- **Rotate the operator key:** re-encrypt the `encrypted_key` row with
  the new master, bump `BANKPAD_MASTER_KEY_VERSION`, redeploy.
- **Rerun a job manually:** `redis-cli` + `BullMQ`'s repeatable job id
  is `<queue>:<lowercased-token-address>`.
```
