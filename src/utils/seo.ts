import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { defaultLocale, localeNames, locales, type Locale } from "@/utils/i18n/config";

export const DEFAULT_OG_IMAGE = { url: "/images/og/kerben-travel-og.jpg", width: 1200, height: 630 } as const;

const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 70;

export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: languageUrls(path),
  };
}

/** hreflang для всех локалей + x-default; пути относительные — их достраивает metadataBase */
export function languageUrls(path: string, base = ""): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((l) => [localeNames[l].htmlLang, `${base}/${l}${path}`])),
    "x-default": `${base}/${defaultLocale}${path}`,
  };
}

export const ogLocale = (locale: Locale) => localeNames[locale].intl.replace("-", "_");

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/[\s,.;:—–-]+\S*$/, "")}…`;
}

/** Описание страницы: короткий текст из backend дополняется общим описанием раздела */
export function metaDescription(text: string | null | undefined, fallback: string): string {
  const own = (text ?? "").replace(/\s+/g, " ").trim();
  if (own.length >= DESCRIPTION_MIN) return truncate(own, DESCRIPTION_MAX);
  const glue = /[。！？]$/.test(own) ? "" : /[.!?…]$/.test(own) ? " " : ". ";
  const joined = own ? `${own}${glue}${fallback}` : fallback;
  return truncate(joined, DESCRIPTION_MAX);
}

interface PageSeo {
  locale: Locale;
  /** Путь без локали: "" для главной, "/tours", "/tours/48" */
  path: string;
  title: string;
  description?: string;
  image?: string | null;
}

/** title, description, canonical, hreflang, Open Graph и Twitter одной страницы */
export function pageMetadata({ locale, path, title, description, image }: PageSeo): Metadata {
  const images = image ? [{ url: image }] : [DEFAULT_OG_IMAGE];
  return {
    title,
    ...(description ? { description } : {}),
    alternates: alternates(locale, path),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: ogLocale(locale),
      url: `/${locale}${path}`,
      title,
      ...(description ? { description } : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
      images: images.map((item) => item.url),
    },
  };
}
