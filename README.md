# Bankpad

Bankpad is a memecoin launchpad on Robinhood Chain where every token is paired with a real country currency (USD, EUR, GBP, JPY, INR, and more) instead of a stock or ETH. Tokens graduate off a bonding curve into a locked Uniswap V4 pool.

**Live:** https://bankpad-three.vercel.app

## Stack

- React 19 + TanStack Router / Start (SSR)
- Vite + Tailwind CSS v4
- shadcn/ui components
- Supabase (Postgres + Auth)
- viem for on-chain reads
- Nitro (Vercel preset)

## Development

Requires Node.js 20+ and [Bun](https://bun.sh).

```sh
git clone https://github.com/GlitchBaneOnChain/currency-bond-launch.git
cd currency-bond-launch
bun install
bun run dev
```

Copy `.env.example` to `.env` and fill in your Supabase project URL and publishable key before starting.

## Build

```sh
bun run build       # production build (uses $NITRO_PRESET, default node-server)
NITRO_PRESET=vercel bun run build  # build for Vercel
```

## Deploy

Pushes to `main` deploy automatically to Vercel (`vercel.json` pins `NITRO_PRESET=vercel`).
