import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getHelicopterTours, getHotels, getTransports, getTrekkings } from "@/utils/api/catalog";
import { getTours } from "@/utils/api/tours";
import { defaultLocale, locales } from "@/utils/i18n/config";
import { languageUrls } from "@/utils/seo";
import { THEMES } from "@/utils/tour-filters";

const PAGES = ["", "/tours", "/attractions", "/hotels", "/trekking", "/transport", "/helicopter", "/about", "/faq", "/contact", "/credits"];

const DETAIL = /^\/(tours|hotels|trekking|transport|helicopter)\/[^/]+$/;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, treks, hotels, cars, flights] = await Promise.all([
    getTours(defaultLocale),
    getTrekkings(defaultLocale),
    getHotels(defaultLocale),
    getTransports(defaultLocale),
    getHelicopterTours(defaultLocale),
  ]);
  const paths = [
    ...PAGES,
    ...THEMES.map((theme) => `/experiences/${theme}`),
    ...tours.map((tour) => `/tours/${tour.slug}`),
    ...treks.map((trek) => `/trekking/${trek.id}`),
    ...hotels.map((hotel) => `/hotels/${hotel.id}`),
    ...cars.map((car) => `/transport/${car.id}`),
    ...flights.map((flight) => `/helicopter/${flight.id}`),
  ];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      changeFrequency: DETAIL.test(path) ? "weekly" : "monthly",
      priority: path === "" ? 1 : path.startsWith("/tours") ? 0.8 : DETAIL.test(path) ? 0.6 : 0.5,
      alternates: { languages: languageUrls(path, siteConfig.url) },
    })),
  );
}
