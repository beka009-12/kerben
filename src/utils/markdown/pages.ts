import "server-only";
import { EXPERIENCES } from "@/data/experiences";
import type { Tour } from "@/types/tour";
import { getAboutSections, getFaqs, getHelicopterTours, getHotels, getTransports, getTrekkings, type HelicopterItem, type HotelItem, type TransportItem, type TrekkingItem } from "@/utils/api/catalog";
import { getContacts, type SiteContacts } from "@/utils/api/contacts";
import { getTours } from "@/utils/api/tours";
import { siteConfig } from "@/config/site";
import { carSeo, hotelSeo } from "@/utils/detail-seo";
import type { Locale } from "@/utils/i18n/config";
import { getDictionary, type Dictionary } from "@/utils/i18n/dictionaries";
import { inKyrgyzstan } from "@/utils/markers";
import { defaultFilters, filterTours, THEMES, type Theme } from "@/utils/tour-filters";
import {
  aboutDocument,
  attractionsDocument,
  carDocument,
  contactDocument,
  creditsDocument,
  experienceDocument,
  faqDocument,
  flightDocument,
  helicopterDocument,
  homeDocument,
  hotelDocument,
  hotelsDocument,
  tourDocument,
  toursDocument,
  trekDocument,
  trekkingDocument,
  transportDocument,
} from "./documents";

export interface SiteData {
  locale: Locale;
  dict: Dictionary;
  contacts: SiteContacts;
  tours: Tour[];
  hotels: HotelItem[];
  treks: TrekkingItem[];
  cars: TransportItem[];
  flights: HelicopterItem[];
}

/** Те же функции данных, что у HTML-страниц: Markdown и страница берут один и тот же кеш */
export async function loadSiteData(locale: Locale): Promise<SiteData> {
  const [dict, contacts, tours, hotels, treks, cars, flights] = await Promise.all([
    getDictionary(locale),
    getContacts(locale),
    getTours(locale),
    getHotels(locale),
    getTrekkings(locale),
    getTransports(locale),
    getHelicopterTours(locale),
  ]);
  return { locale, dict, contacts, tours, hotels, treks, cars, flights };
}

const isTheme = (value: string): value is Theme => (THEMES as readonly string[]).includes(value);

const STATIC_TITLES: Record<string, (m: Dictionary["meta"]) => string> = {
  "": (m) => m.title,
  "/tours": (m) => m.toursTitle,
  "/attractions": (m) => m.attractionsTitle,
  "/hotels": (m) => m.hotelsTitle,
  "/trekking": (m) => m.trekkingTitle,
  "/transport": (m) => m.transportTitle,
  "/helicopter": (m) => m.helicopterTitle,
  "/about": (m) => m.aboutTitle,
  "/faq": (m) => m.faqTitle,
  "/contact": (m) => m.contactTitle,
  "/credits": (m) => m.creditsTitle,
};

/** Заголовок страницы, как в <title> без «— Kerben Travel»; null — такой страницы нет */
export function pageTitle(site: SiteData, path: string): string | null {
  const { dict, locale } = site;
  const fixed = STATIC_TITLES[path];
  if (fixed) return fixed(dict.meta);
  const parts = path.split("/");
  if (parts.length !== 3) return null;
  const [, kind, id] = parts;
  switch (kind) {
    case "experiences":
      return isTheme(id) ? (dict.home.experiences.items[THEMES.indexOf(id)]?.seoTitle ?? null) : null;
    case "tours":
      return site.tours.find((tour) => tour.slug === id)?.title ?? null;
    case "hotels": {
      const hotel = site.hotels.find((item) => item.id === id);
      return hotel ? hotelSeo(hotel, locale, dict).title : null;
    }
    case "trekking":
      return site.treks.find((trek) => String(trek.id) === id)?.title ?? null;
    case "transport": {
      const car = site.cars.find((item) => String(item.id) === id);
      return car ? carSeo(car, locale, dict).title : null;
    }
    case "helicopter":
      return site.flights.find((flight) => String(flight.id) === id)?.title ?? null;
    default:
      return null;
  }
}

const faqsOr = async (locale: Locale, dict: Dictionary) => {
  const faqs = await getFaqs(locale);
  return faqs.length > 0 ? faqs : dict.home.faq.items;
};

/** Markdown-версия публичной страницы; null — страницы нет (обработчик отдаст 404) */
export async function pageMarkdown(locale: Locale, path: string): Promise<string | null> {
  const site = await loadSiteData(locale);
  const title = pageTitle(site, path);
  if (title === null) return null;
  const { dict, contacts } = site;
  const ctx = { locale, dict, contacts };
  const [, kind, id] = path.split("/");

  if (path === "") {
    const popular = [...site.tours.filter((tour) => inKyrgyzstan(tour.coords)), ...site.tours.filter((tour) => !inKyrgyzstan(tour.coords))].slice(0, 9);
    return homeDocument(ctx, { title, description: dict.meta.description, popular, faqs: await faqsOr(locale, dict) }, EXPERIENCES.map((item) => item.theme));
  }

  switch (path) {
    case "/tours":
      return toursDocument(ctx, site.tours, title, dict.meta.toursDescription);
    case "/hotels":
      return hotelsDocument(ctx, site.hotels, title);
    case "/trekking":
      return trekkingDocument(ctx, site.treks, title);
    case "/transport":
      return transportDocument(ctx, site.cars, title);
    case "/helicopter":
      return helicopterDocument(ctx, site.flights, title);
    case "/attractions":
      return attractionsDocument(ctx, title);
    case "/faq":
      return faqDocument(ctx, await faqsOr(locale, dict), title);
    case "/about":
      return aboutDocument(ctx, await getAboutSections(locale), title);
    case "/contact": {
      const socials = [contacts.instagramHref, contacts.facebookHref, siteConfig.telegramChannel, siteConfig.twoGis.url].filter((href): href is string => Boolean(href));
      return contactDocument(ctx, title, socials);
    }
    case "/credits":
      return creditsDocument(ctx, title);
  }

  switch (kind) {
    case "experiences": {
      if (!isTheme(id)) return null;
      const item = dict.home.experiences.items[THEMES.indexOf(id)];
      return experienceDocument(ctx, id, item, filterTours(site.tours, { ...defaultFilters, theme: id }), title);
    }
    case "tours": {
      const tour = site.tours.find((item) => item.slug === id);
      return tour ? tourDocument(ctx, tour) : null;
    }
    case "hotels": {
      const hotel = site.hotels.find((item) => item.id === id);
      return hotel ? hotelDocument(ctx, hotel) : null;
    }
    case "trekking": {
      const trek = site.treks.find((item) => String(item.id) === id);
      return trek ? trekDocument(ctx, trek) : null;
    }
    case "transport": {
      const car = site.cars.find((item) => String(item.id) === id);
      return car ? carDocument(ctx, car) : null;
    }
    case "helicopter": {
      const flight = site.flights.find((item) => String(item.id) === id);
      return flight ? flightDocument(ctx, flight) : null;
    }
  }
  return null;
}
