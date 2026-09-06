/** Maps a country (ISO 3166-1 alpha-2) to the Bankpad currency pair it launches under. */
const EUROZONE = [
  "AT",
  "BE",
  "HR",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
];

export const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  JP: "JPY",
  CA: "CAD",
  AU: "AUD",
  IN: "INR",
  CH: "CHF",
  BR: "BRL",
  KR: "KRW",
  MX: "MXN",
  NG: "NGN",
  ...Object.fromEntries(EUROZONE.map((c) => [c, "EUR"])),
};

export function currencyForCountry(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return COUNTRY_CURRENCY[iso.toUpperCase()] ?? null;
}
