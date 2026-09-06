# Global Coin Launchpad

Build a complete, modern, dark-themed web application shell for Bankpad — a memecoin launchpad on Robinhood Chain.Core concept:
Bankpad is exactly like pons.family / ponsfamily.com, but instead of pairing tokens with stocks or ETH, every token is paired with a country currency (USD, EUR, GBP, JPY, INR, etc.). Brand it around banks, global currencies, and finance.Key pages & sections to include:

Homepage / Landing

Bold hero section: “Launch coins paired with real country currencies”

Short explanation of how it works (Bonding curve → Graduation to locked Uniswap V4 pool)

Big “Launch Token” button

Live stats bar (Total launches, Volume, Fees paid to creators)

Gallery of recent / trending launches with country flags

Launch Token page (/launch)

Clean form with:

Token name

Ticker (symbol)

Description

Logo upload

Website / Twitter / Telegram links

Country Currency selector (dropdown or grid with flags: USD, EUR, GBP, JPY, CAD, AUD, INR, etc.)

Optional: Creator tax percentage

Live preview of the token card on the right side

“Launch” button that looks premium and trustworthy

Clear fee info (tiny launch fee + trading fee split)

Token Detail page (/token/[address])

Token header with logo, name, ticker, country flag of the pair

Live bonding curve progress / graduation progress bar

Price chart

Buy / Sell interface

Holders, volume, liquidity stats

Creator fee claim section

Social links

Explore / All Launches page

Filterable grid or list of all tokens

Filters: Country currency, graduated / not graduated, volume, newest

Each card shows country flag + pair (e.g. PEPE / USD, DOGE / EUR)

Creator Dashboard

List of tokens you launched

Claimable fees in the paired country currency

Simple analytics

Design requirements:

Dark theme (deep navy/black background, clean whites, electric blue or gold accents)

Finance / banking aesthetic mixed with modern crypto (subtle currency symbols, clean typography)

Mobile responsive

Smooth animations and micro-interactions

Professional and trustworthy feel (not overly meme-y)

Use a modern font stack (Inter or similar)

Include wallet connect button in the navbar (mocked for now)

Technical notes for the shell:

Use Next.js + Tailwind + shadcn/ui style components

Make all data mocked with realistic sample tokens paired to different currencies

Include placeholder states for “Connecting wallet…”, “Launching…”, “Graduated”, etc.

Make the navigation clean: Logo | Launch | Explore | Dashboard | Connect Wallet

Make the entire experience feel premium, fast, and ready for real smart-contract integration later. Focus on beautiful UI/UX first. since it is called Bankpad (the layout should play on a bank and a launchpad)

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://currency-bond-launch.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5cb9bf57-bc77-41fe-8037-82faf9312f11).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
