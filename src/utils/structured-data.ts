import { siteConfig } from "@/config/site";
import { NO_PHOTO } from "@/data/images";
import type { Tour } from "@/types/tour";
import type { HotelItem } from "@/utils/api/catalog";
import type { SiteContacts } from "@/utils/api/contacts";
import { localeNames, type Locale } from "@/utils/i18n/config";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonLdNode = { [key: string]: JsonValue };

/** Один @id компании на всех страницах: Google склеивает упоминания в одну сущность */
export const ORGANIZATION_ID = `${siteConfig.url}/#organization`;

export const absoluteUrl = (src: string): string =>
  /^https?:\/\//i.test(src) ? src : `${siteConfig.url}${src.startsWith("/") ? "" : "/"}${src}`;

/** Как в документации Next: `<` экранируется, иначе строка из backend может закрыть <script> */
export const serializeJsonLd = (data: JsonLdNode): string => JSON.stringify(data).replace(/</g, "\\u003c");

/** Только настоящие фото: без заглушки и повторов, с абсолютными адресами */
const photos = (main: string, gallery: string[]): string[] =>
  [...new Set([main, ...gallery])].filter((src) => src && src !== NO_PHOTO).map(absoluteUrl);

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
  const images = photos(tour.image, tour.gallery);
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

interface HotelJsonLdInput {
  hotel: HotelItem;
  locale: Locale;
  labels: { home: string; hotels: string };
  /** Удобства теми же словами, что и на странице */
  amenities: string[];
  /** Цена так, как её видит гость в карточке бронирования */
  priceRange?: string;
}

/**
 * LodgingBusiness, а не Hotel: в каталоге рядом с отелями стоят лоджи и юрточные лагеря.
 * Звёзды не размечаем — на странице отеля их не показывают.
 */
export function hotelJsonLd({ hotel, locale, labels, amenities, priceRange }: HotelJsonLdInput): JsonLdNode {
  const path = `/${locale}/hotels/${hotel.id}`;
  const url = absoluteUrl(path);
  const images = photos(hotel.image, hotel.gallery);
  const description = hotel.description.trim();
  const street = hotel.address.trim();
  const locality = hotel.location.trim();

  const lodging: JsonLdNode = {
    "@type": "LodgingBusiness",
    "@id": `${url}#lodging`,
    name: hotel.name,
    url,
    ...(description ? { description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(street || locality
      ? {
          address: {
            "@type": "PostalAddress",
            ...(street ? { streetAddress: street } : {}),
            ...(locality ? { addressLocality: locality } : {}),
          },
        }
      : {}),
    ...(hotel.coords ? { geo: { "@type": "GeoCoordinates", latitude: hotel.coords[1], longitude: hotel.coords[0] } } : {}),
    ...(priceRange ? { priceRange } : {}),
    ...(amenities.length > 0
      ? { amenityFeature: amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })) }
      : {}),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      lodging,
      breadcrumbList([
        { name: labels.home, path: `/${locale}` },
        { name: labels.hotels, path: `/${locale}/hotels` },
        { name: hotel.name, path },
      ]),
    ],
  };
}

interface HomeJsonLdInput {
  locale: Locale;
  contacts: Pick<SiteContacts, "email" | "phone" | "instagramHref" | "facebookHref">;
}

/**
 * Главная: компания и сайт одним графом. alternateName — как бренд пишут в поиске на разных языках;
 * WebSite с name/alternateName Google берёт для названия сайта в выдаче.
 * sameAs со своими соцсетями отличает компанию от тёзок с другими сайтами.
 */
export function homeJsonLd({ locale, contacts }: HomeJsonLdInput): JsonLdNode {
  const alternateName = [...siteConfig.alternateNames];
  const sameAs = [contacts.instagramHref, contacts.facebookHref, siteConfig.telegramChannel, siteConfig.twoGis.url].filter((href): href is string => Boolean(href));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": ORGANIZATION_ID,
        name: siteConfig.name,
        alternateName,
        url: absoluteUrl(`/${locale}`),
        ...(contacts.email ? { email: contacts.email } : {}),
        ...(contacts.phone ? { telephone: contacts.phone } : {}),
        areaServed: ["Kyrgyzstan", "Kazakhstan", "Uzbekistan"],
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        alternateName,
        url: `${siteConfig.url}/`,
        inLanguage: localeNames[locale].htmlLang,
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}
