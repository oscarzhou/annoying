export type CurrencyDefinition = {
  code: string;
  name: string;
  minorUnit: number;
  aliases: readonly string[];
  prototypeRate?: { numerator: number; denominator: number };
};

export const GROUP_CURRENCY = "NZD";

export const currencies: readonly CurrencyDefinition[] = [
  { code: "NZD", name: "New Zealand dollar", minorUnit: 2, aliases: ["new zealand", "kiwi dollar", "nzd"], prototypeRate: { numerator: 1, denominator: 1 } },
  { code: "AUD", name: "Australian dollar", minorUnit: 2, aliases: ["australian dollar", "aussie dollar", "aud"], prototypeRate: { numerator: 1109, denominator: 1000 } },
  { code: "USD", name: "US dollar", minorUnit: 2, aliases: ["us dollar", "american dollar", "usd"], prototypeRate: { numerator: 162, denominator: 100 } },
  { code: "CNY", name: "Chinese yuan", minorUnit: 2, aliases: ["yuan", "renminbi", "rmb"] },
  { code: "KRW", name: "South Korean won", minorUnit: 0, aliases: ["won", "korean won"] },
  { code: "JPY", name: "Japanese yen", minorUnit: 0, aliases: ["yen", "japanese yen"] },
  { code: "EUR", name: "Euro", minorUnit: 2, aliases: ["euro", "euros"] },
  { code: "GBP", name: "British pound", minorUnit: 2, aliases: ["pound", "pounds", "sterling"] },
  { code: "SGD", name: "Singapore dollar", minorUnit: 2, aliases: ["singapore dollar"] },
  { code: "HKD", name: "Hong Kong dollar", minorUnit: 2, aliases: ["hong kong dollar"] },
  { code: "CAD", name: "Canadian dollar", minorUnit: 2, aliases: ["canadian dollar"] },
  { code: "CHF", name: "Swiss franc", minorUnit: 2, aliases: ["swiss franc", "franc"] },
  { code: "INR", name: "Indian rupee", minorUnit: 2, aliases: ["rupee", "rupees"] },
  { code: "THB", name: "Thai baht", minorUnit: 2, aliases: ["baht"] },
  { code: "KWD", name: "Kuwaiti dinar", minorUnit: 3, aliases: ["kuwaiti dinar", "dinar"] },
] as const;

export function getCurrency(code: string) {
  return currencies.find((currency) => currency.code === code) ?? currencies[0];
}

export function parseAmountToMinor(value: string, minorUnit: number) {
  const expression = minorUnit === 0 ? /^(\d+)$/ : new RegExp(`^(\\d+)(?:\\.(\\d{1,${minorUnit}}))?$`);
  const match = value.trim().match(expression);
  if (!match) return Number.NaN;
  const whole = Number.parseInt(match[1], 10);
  const fraction = Number.parseInt((match[2] ?? "").padEnd(minorUnit, "0") || "0", 10);
  const scale = 10 ** minorUnit;
  const minor = whole * scale + fraction;
  return Number.isSafeInteger(minor) ? minor : Number.NaN;
}

export function convertPrototypeToGroupMinor(minor: number, code: string) {
  const rate = getCurrency(code).prototypeRate;
  if (!rate || !Number.isSafeInteger(minor)) return null;
  return Math.floor((minor * rate.numerator + Math.floor(rate.denominator / 2)) / rate.denominator);
}

export function searchCurrencies(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return currencies;
  return currencies.filter((currency) => currency.code.toLowerCase().includes(normalized) || currency.name.toLowerCase().includes(normalized) || currency.aliases.some((alias) => alias.includes(normalized)));
}
