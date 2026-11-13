import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getTrekkings } from "@/utils/api/catalog";
import { getTours } from "@/utils/api/tours";
import { defaultLocale, localeNames, locales } from "@/utils/i18n/config";
import { THEMES } from "@/utils/tour-filters";

const PAGES = ["", "/tours", "/attractions", "/destinations", "/hotels", "/trekking", "/transport", "/helicopter", "/chat", "/about", "/faq", "/contact", "/credits"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, treks] = await Promise.all([getTours(defaultLocale), getTrekkings(defaultLocale)]);
  const paths = [...PAGES, ...THEMES.map((theme) => `/experiences/${theme}`), ...tours.map((tour) => `/tours/${tour.slug}`), ...treks.map((trek) => `/trekking/${trek.id}`)];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      changeFrequency: path.startsWith("/tours/") ? "weekly" : "monthly",
      priority: path === "" ? 1 : path.startsWith("/tours") ? 0.8 : 0.5,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [localeNames[l].htmlLang, `${siteConfig.url}/${l}${path}`])),
      },
    })),
  );
}
