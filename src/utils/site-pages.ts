import { getHelicopterTours, getHotels, getTransports, getTrekkings } from "@/utils/api/catalog";
import { getTours } from "@/utils/api/tours";
import { defaultLocale } from "@/utils/i18n/config";
import { THEMES } from "@/utils/tour-filters";

/** Публичные страницы без id. Закрытые (чат, поездки, вход, админка) сюда не входят — они закрыты в robots.txt */
export const STATIC_PAGES = ["", "/tours", "/attractions", "/hotels", "/trekking", "/transport", "/helicopter", "/about", "/faq", "/contact", "/credits"] as const;

export const DETAIL_PATH = /^\/(tours|hotels|trekking|transport|helicopter)\/[^/]+$/;

/**
 * Все публичные пути без локали — один список и для sitemap.xml, и для карты Markdown-версий.
 * id одинаковы во всех языках, поэтому каталог берётся на языке по умолчанию.
 */
export async function publicPaths(): Promise<string[]> {
  const [tours, treks, hotels, cars, flights] = await Promise.all([
    getTours(defaultLocale),
    getTrekkings(defaultLocale),
    getHotels(defaultLocale),
    getTransports(defaultLocale),
    getHelicopterTours(defaultLocale),
  ]);
  return [
    ...STATIC_PAGES,
    ...THEMES.map((theme) => `/experiences/${theme}`),
    ...tours.map((tour) => `/tours/${tour.slug}`),
    ...treks.map((trek) => `/trekking/${trek.id}`),
    ...hotels.map((hotel) => `/hotels/${hotel.id}`),
    ...cars.map((car) => `/transport/${car.id}`),
    ...flights.map((flight) => `/helicopter/${flight.id}`),
  ];
}
