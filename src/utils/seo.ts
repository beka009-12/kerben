import type { Metadata } from "next";
import { defaultLocale, localeNames, locales, type Locale } from "@/utils/i18n/config";

export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [localeNames[l].htmlLang, `/${l}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}
