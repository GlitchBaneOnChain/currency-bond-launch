//#region node_modules/.nitro/vite/services/ssr/assets/market-qqUb7Jkc.js
var CURRENCIES = [
	{
		code: "USD",
		name: "US Dollar",
		symbol: "$",
		flag: "🇺🇸",
		country: "United States"
	},
	{
		code: "EUR",
		name: "Euro",
		symbol: "€",
		flag: "🇪🇺",
		country: "Eurozone"
	},
	{
		code: "GBP",
		name: "Pound Sterling",
		symbol: "£",
		flag: "🇬🇧",
		country: "United Kingdom"
	},
	{
		code: "JPY",
		name: "Japanese Yen",
		symbol: "¥",
		flag: "🇯🇵",
		country: "Japan"
	},
	{
		code: "CAD",
		name: "Canadian Dollar",
		symbol: "C$",
		flag: "🇨🇦",
		country: "Canada"
	},
	{
		code: "AUD",
		name: "Australian Dollar",
		symbol: "A$",
		flag: "🇦🇺",
		country: "Australia"
	},
	{
		code: "INR",
		name: "Indian Rupee",
		symbol: "₹",
		flag: "🇮🇳",
		country: "India"
	},
	{
		code: "CHF",
		name: "Swiss Franc",
		symbol: "Fr",
		flag: "🇨🇭",
		country: "Switzerland"
	},
	{
		code: "BRL",
		name: "Brazilian Real",
		symbol: "R$",
		flag: "🇧🇷",
		country: "Brazil"
	},
	{
		code: "KRW",
		name: "Korean Won",
		symbol: "₩",
		flag: "🇰🇷",
		country: "South Korea"
	},
	{
		code: "MXN",
		name: "Mexican Peso",
		symbol: "Mex$",
		flag: "🇲🇽",
		country: "Mexico"
	},
	{
		code: "NGN",
		name: "Nigerian Naira",
		symbol: "₦",
		flag: "🇳🇬",
		country: "Nigeria"
	}
];
var CURRENCY_CODES = CURRENCIES.map((c) => c.code);
function currency(code) {
	return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
var TOTAL_SUPPLY = 1e9;
var num = (v) => v == null ? 0 : Number(v);
function toTokenView(row) {
	const price = num(row.price);
	const prev = row.price_24h_ago == null ? null : Number(row.price_24h_ago);
	return {
		id: String(row.id),
		address: String(row.address),
		name: String(row.name),
		ticker: String(row.ticker),
		emoji: String(row.emoji ?? "🏦"),
		pair: String(row.pair),
		description: String(row.description ?? ""),
		website: row.website ?? null,
		twitter: row.twitter ?? null,
		telegram: row.telegram ?? null,
		creatorId: String(row.creator_id),
		creatorName: String(row.creator_name ?? "Anonymous"),
		creatorTaxBps: num(row.creator_tax_bps),
		reserve: num(row.reserve),
		tokensSold: num(row.tokens_sold),
		feesAccrued: num(row.fees_accrued),
		feesClaimed: num(row.fees_claimed),
		graduated: Boolean(row.graduated),
		createdAt: String(row.created_at),
		price,
		holders: num(row.holders),
		volume24h: num(row.volume_24h),
		change24h: prev && prev > 0 ? (price - prev) / prev * 100 : 0,
		marketCap: price * TOTAL_SUPPLY,
		progress: Math.min(100, num(row.progress))
	};
}
function compact(n) {
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 1
	}).format(n);
}
function exactMoney(n, code) {
	return `${currency(code).symbol}${n.toLocaleString(void 0, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function tokenPrice(n) {
	if (n === 0) return "0";
	if (n < .01) return n.toPrecision(3);
	return n.toLocaleString(void 0, { maximumFractionDigits: 4 });
}
function timeAgo(iso) {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 6e4);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}
//#endregion
export { exactMoney as a, tokenPrice as c, currency as i, CURRENCY_CODES as n, timeAgo as o, compact as r, toTokenView as s, CURRENCIES as t };
