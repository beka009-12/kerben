import { siteConfig } from "@/config/site";
import { NO_PHOTO } from "@/data/images";
import type { Tour } from "@/types/tour";
import type { Locale } from "@/utils/i18n/config";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonLdNode = { [key: string]: JsonValue };

/** Один @id компании на всех страницах: Google склеивает упоминания в одну сущность */
export const ORGANIZATION_ID = `${siteConfig.url}/#organization`;

export const absoluteUrl = (src: string): string =>
  /^https?:\/\//i.test(src) ? src : `${siteConfig.url}${src.startsWith("/") ? "" : "/"}${src}`;

/** Как в документации Next: `<` экранируется, иначе строка из backend может закрыть <script> */
export const serializeJsonLd = (data: JsonLdNode): string => JSON.stringify(data).replace(/</g, "\\u003c");

interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbList(crumbs: Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

interface TourJsonLdInput {
  tour: Tour;
  locale: Locale;
  labels: { home: string; tours: string };
}

/**
 * TouristTrip описывает поездку, но Google не строит по нему расширенный сниппет.
 * Второй тип Product даёт право на сниппет с ценой и звёздами — при тех же видимых данных.
 */
export function tourJsonLd({ tour, locale, labels }: TourJsonLdInput): JsonLdNode {
  const path = `/${locale}/tours/${tour.slug}`;
  const url = absoluteUrl(path);
  const images = [...new Set([tour.image, ...tour.gallery])].filter((src) => src && src !== NO_PHOTO).map(absoluteUrl);
  const stages = tour.itinerary.filter((stage) => stage.title.trim());

  const trip: JsonLdNode = {
    "@type": ["TouristTrip", "Product"],
    "@id": `${url}#tour`,
    name: tour.title,
    url,
    ...(tour.summary ? { description: tour.summary } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    brand: { "@type": "Brand", name: siteConfig.name },
    provider: { "@type": "Organization", "@id": ORGANIZATION_ID, name: siteConfig.name, url: siteConfig.url },
    // Неактивные туры отфильтрованы ещё в getTours, поэтому всё, что на сайте, можно забронировать
    ...(tour.price > 0
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: tour.price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            seller: { "@id": ORGANIZATION_ID },
          },
        }
      : {}),
    ...(tour.reviews > 0 && tour.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: tour.rating,
            reviewCount: tour.reviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(stages.length > 0
      ? {
          itinerary: {
            "@type": "ItemList",
            numberOfItems: stages.length,
            itemListElement: stages.map((stage, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: stage.title.trim(),
              ...(stage.text.trim() ? { description: stage.text.trim() } : {}),
            })),
          },
        }
      : {}),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      trip,
      breadcrumbList([
        { name: labels.home, path: `/${locale}` },
        { name: labels.tours, path: `/${locale}/tours` },
        { name: tour.title, path },
      ]),
    ],
  };
}
