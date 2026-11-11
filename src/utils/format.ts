import { localeNames, type Locale } from "@/utils/i18n/config";

export function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeNames[locale].intl, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMoney(value: number, locale: Locale, currency: "USD" | "RUB"): string {
  return new Intl.NumberFormat(localeNames[locale].intl, { style: "currency", currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(value);
}

export function formatCompact(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeNames[locale].intl, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeNames[locale].intl).format(value);
}

/** Слово в нужной форме для числа: 1 день, 2 дня, 5 дней (правила языка через Intl.PluralRules) */
export function plural(count: number, locale: Locale, forms: { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>): string {
  return forms[new Intl.PluralRules(localeNames[locale].intl).select(count)] ?? forms.other;
}
