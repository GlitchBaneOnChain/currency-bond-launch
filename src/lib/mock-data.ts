export type Currency = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
};

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", country: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", country: "Eurozone" },
  { code: "GBP", name: "Pound Sterling", symbol: "£", flag: "🇬🇧", country: "United Kingdom" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", country: "Japan" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", country: "Australia" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", country: "India" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭", country: "Switzerland" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", country: "Brazil" },
  { code: "KRW", name: "Korean Won", symbol: "₩", flag: "🇰🇷", country: "South Korea" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", flag: "🇲🇽", country: "Mexico" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", country: "Nigeria" },
];

export function currency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? (CURRENCIES[0] as Currency);
}

export type Token = {
  address: string;
  name: string;
  ticker: string;
  emoji: string;
  pair: string;
  description: string;
  creator: string;
  createdAgo: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  progress: number;
  graduated: boolean;
  creatorFees: number;
  website?: string;
  twitter?: string;
  telegram?: string;
};

export const TOKENS: Token[] = [
  {
    address: "0x7ac1f0b2c9d84e5a6f31b8d0e2c4a9315fbd7e21",
    name: "Pepe Reserve",
    ticker: "PEPE",
    emoji: "🐸",
    pair: "USD",
    description:
      "The frog standard. Pepe Reserve is a community coin paired to the world reserve currency, backed by nothing but conviction.",
    creator: "0x91ab...42fe",
    createdAgo: "12m ago",
    price: 0.0000412,
    change24h: 34.2,
    marketCap: 412000,
    volume24h: 184300,
    liquidity: 96200,
    holders: 1842,
    progress: 78,
    graduated: false,
    creatorFees: 1240.55,
    website: "https://pepereserve.xyz",
    twitter: "https://x.com/pepereserve",
    telegram: "https://t.me/pepereserve",
  },
  {
    address: "0x33e9d1a7c05b46f28ba71c0de49f5c8a2b6d1147",
    name: "Baguette Bank",
    ticker: "BGT",
    emoji: "🥖",
    pair: "EUR",
    description: "Paris opens, the curve fills. Baguette Bank is the euro-denominated bakery of Robinhood Chain.",
    creator: "0x44cd...09a1",
    createdAgo: "48m ago",
    price: 0.00119,
    change24h: -8.4,
    marketCap: 891000,
    volume24h: 322900,
    liquidity: 210400,
    holders: 3120,
    progress: 100,
    graduated: true,
    creatorFees: 8420.1,
    website: "https://baguette.bank",
    twitter: "https://x.com/baguettebank",
  },
  {
    address: "0xa10c7f9e3b2d5148ce6f0a97d3b5124e8c7f0aa9",
    name: "Doge Sterling",
    ticker: "DOGE",
    emoji: "🐕",
    pair: "GBP",
    description: "Much pound. Very sterling. The original good boy, now with a London desk.",
    creator: "0x77ee...5b30",
    createdAgo: "2h ago",
    price: 0.00842,
    change24h: 12.9,
    marketCap: 1420000,
    volume24h: 601000,
    liquidity: 388000,
    holders: 5410,
    progress: 100,
    graduated: true,
    creatorFees: 14210.87,
    twitter: "https://x.com/dogesterling",
    telegram: "https://t.me/dogesterling",
  },
  {
    address: "0xc0ffee11223344556677889900aabbccddeeff01",
    name: "Shiba Yen",
    ticker: "SHIY",
    emoji: "🍣",
    pair: "JPY",
    description: "Tokyo night market energy. Paired to the yen, priced in vibes.",
    creator: "0x12aa...77c4",
    createdAgo: "3h ago",
    price: 0.512,
    change24h: 5.1,
    marketCap: 264000,
    volume24h: 91200,
    liquidity: 61000,
    holders: 908,
    progress: 46,
    graduated: false,
    creatorFees: 512.4,
  },
  {
    address: "0xbeef00998877665544332211aabbccddeeff2233",
    name: "Maple Vault",
    ticker: "MAPLE",
    emoji: "🍁",
    pair: "CAD",
    description: "Polite money. Maple Vault settles every trade with a thank you.",
    creator: "0x63bd...11f0",
    createdAgo: "5h ago",
    price: 0.00031,
    change24h: 61.7,
    marketCap: 138000,
    volume24h: 74400,
    liquidity: 38900,
    holders: 640,
    progress: 31,
    graduated: false,
    creatorFees: 288.9,
  },
  {
    address: "0xdead11ff22ee33dd44cc55bb66aa778899001122",
    name: "Rupee Rocket",
    ticker: "RPEE",
    emoji: "🚀",
    pair: "INR",
    description: "Mumbai to the moon, one rupee at a time.",
    creator: "0x8f21...aa93",
    createdAgo: "7h ago",
    price: 1.24,
    change24h: 22.4,
    marketCap: 702000,
    volume24h: 254000,
    liquidity: 143000,
    holders: 2410,
    progress: 88,
    graduated: false,
    creatorFees: 3120.0,
  },
  {
    address: "0x5150aa11bb22cc33dd44ee55ff6677889900aabb",
    name: "Outback Coin",
    ticker: "OUTB",
    emoji: "🦘",
    pair: "AUD",
    description: "Hops higher than the curve. Sydney desk, global holders.",
    creator: "0x30cc...b721",
    createdAgo: "11h ago",
    price: 0.00088,
    change24h: -3.2,
    marketCap: 96000,
    volume24h: 28800,
    liquidity: 21100,
    holders: 388,
    progress: 19,
    graduated: false,
    creatorFees: 92.3,
  },
  {
    address: "0x9911ee22dd33cc44bb55aa66770088990011ff22",
    name: "Alpine Franc",
    ticker: "ALPF",
    emoji: "🏔️",
    pair: "CHF",
    description: "Private banking, public curve. Discreet, dependable, deeply memetic.",
    creator: "0x5ab0...c331",
    createdAgo: "1d ago",
    price: 0.0421,
    change24h: 2.6,
    marketCap: 1830000,
    volume24h: 412000,
    liquidity: 520000,
    holders: 6120,
    progress: 100,
    graduated: true,
    creatorFees: 20140.6,
  },
  {
    address: "0x2244668800aabbccddeeff11223344556677aa99",
    name: "Samba Real",
    ticker: "SMBA",
    emoji: "🥁",
    pair: "BRL",
    description: "Carnival liquidity. The loudest ticker in São Paulo.",
    creator: "0xa7f3...2200",
    createdAgo: "1d ago",
    price: 0.0074,
    change24h: 44.8,
    marketCap: 322000,
    volume24h: 133000,
    liquidity: 88000,
    holders: 1290,
    progress: 64,
    graduated: false,
    creatorFees: 1044.2,
  },
  {
    address: "0x77aa88bb99cc00dd11ee22ff3344556677889900",
    name: "Kimchi Won",
    ticker: "KMCH",
    emoji: "🌶️",
    pair: "KRW",
    description: "Seoul heat, won-denominated. Spice with a settlement layer.",
    creator: "0xdd41...9e77",
    createdAgo: "2d ago",
    price: 12.4,
    change24h: 9.3,
    marketCap: 588000,
    volume24h: 199000,
    liquidity: 121000,
    holders: 2020,
    progress: 92,
    graduated: false,
    creatorFees: 2410.9,
  },
  {
    address: "0x3311557799bbddff002244668800aaccee113355",
    name: "Naira Nation",
    ticker: "NAIR",
    emoji: "🦁",
    pair: "NGN",
    description: "Lagos builds fast. Naira Nation is community owned from block one.",
    creator: "0x9c02...4411",
    createdAgo: "2d ago",
    price: 4.12,
    change24h: 17.1,
    marketCap: 211000,
    volume24h: 82000,
    liquidity: 44000,
    holders: 1110,
    progress: 55,
    graduated: false,
    creatorFees: 640.15,
  },
  {
    address: "0x8800aa11bb22cc33dd44ee55ff66770099881122",
    name: "Peso Press",
    ticker: "PESO",
    emoji: "🌮",
    pair: "MXN",
    description: "Mexico City minted. Peso Press prints memes, not inflation.",
    creator: "0x4e88...0f2a",
    createdAgo: "3d ago",
    price: 0.221,
    change24h: -11.5,
    marketCap: 129000,
    volume24h: 41000,
    liquidity: 30500,
    holders: 512,
    progress: 27,
    graduated: false,
    creatorFees: 180.75,
  },
];

export function tokenByAddress(address: string): Token | undefined {
  return TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase());
}

export const MY_TOKENS: Token[] = [TOKENS[0], TOKENS[4], TOKENS[8]].filter(Boolean) as Token[];

export function priceSeries(seed: number, points = 60) {
  const out: { t: number; p: number }[] = [];
  let p = 100;
  let s = seed;
  for (let i = 0; i < points; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    p = Math.max(20, p * (1 + (r - 0.44) * 0.09));
    out.push({ t: i, p: Number(p.toFixed(2)) });
  }
  return out;
}

export function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function money(n: number, code: string) {
  const c = currency(code);
  return `${c.symbol}${compact(n)}`;
}
