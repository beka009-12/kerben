import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { NO_PHOTO } from "@/data/images";
import type { Tour } from "@/types/tour";
import type { HotelItem } from "@/utils/api/catalog";
import { homeJsonLd, hotelJsonLd, ORGANIZATION_ID, serializeJsonLd, tourJsonLd } from "@/utils/structured-data";

const base = siteConfig.url;

const tour: Tour = {
  id: 57,
  slug: "57",
  place: "Таш-Рабат",
  title: "Таш-Рабат: караван-сарай Шёлкового пути",
  country: "Кыргызстан",
  summary: "Каменный караван-сарай XV века в горах Нарына.",
  overview: "Каменный караван-сарай XV века в горах Нарына. Ночь в юрте.",
  region: "asia",
  coords: [74.77, 41.45],
  image: "https://api.kerben-travel.com/media/main.webp",
  gallery: ["https://api.kerben-travel.com/media/2.webp", "https://api.kerben-travel.com/media/main.webp"],
  price: 280,
  rating: 4.8,
  reviews: 12,
  days: 2,
  nights: 1,
  groupSize: "1–8",
  difficulty: null,
  languages: [],
  category: "culture",
  badge: null,
  highlights: [],
  itinerary: [
    { day: "1", title: "Бишкек → Нарын", text: "Выезд утром", coords: [74.77, 41.45] },
    { day: "2", title: "", text: "", coords: [74.77, 41.45] },
    { day: "3", title: "Таш-Рабат", text: "", coords: [74.77, 41.45] },
  ],
  included: [],
  excluded: [],
};

const labels = { home: "Главная", tours: "Туры" };

function nodes(data: ReturnType<typeof tourJsonLd>) {
  const graph = data["@graph"] as Record<string, unknown>[];
  const trip = graph.find((node) => Array.isArray(node["@type"]) && (node["@type"] as string[]).includes("TouristTrip"));
  const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList");
  return { graph, trip: trip ?? {}, crumbs: crumbs ?? {} };
}

describe("JSON-LD страницы тура", () => {
  it("тур — одновременно TouristTrip и Product с каноническим URL", () => {
    const { trip } = nodes(tourJsonLd({ tour, locale: "ru", labels }));
    expect(trip["@type"]).toEqual(["TouristTrip", "Product"]);
    expect(trip).toMatchObject({
      "@id": `${base}/ru/tours/57#tour`,
      name: tour.title,
      url: `${base}/ru/tours/57`,
      description: tour.summary,
      brand: { "@type": "Brand", name: siteConfig.name },
      provider: { "@type": "Organization", "@id": ORGANIZATION_ID, name: siteConfig.name },
    });
  });

  it("цена: Offer в USD со ссылкой на страницу тура", () => {
    const { trip } = nodes(tourJsonLd({ tour, locale: "en", labels }));
    expect(trip.offers).toEqual({
      "@type": "Offer",
      url: `${base}/en/tours/57`,
      price: 280,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: { "@id": ORGANIZATION_ID },
    });
  });

  it("без цены Offer не выдумывается", () => {
    const { trip } = nodes(tourJsonLd({ tour: { ...tour, price: 0 }, locale: "ru", labels }));
    expect(trip).not.toHaveProperty("offers");
  });

  it("рейтинг только при наличии отзывов", () => {
    expect(nodes(tourJsonLd({ tour, locale: "ru", labels })).trip.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.8,
      reviewCount: 12,
      bestRating: 5,
      worstRating: 1,
    });
    const { trip } = nodes(tourJsonLd({ tour: { ...tour, reviews: 0, rating: 0 }, locale: "ru", labels }));
    expect(trip).not.toHaveProperty("aggregateRating");
  });

  it("картинки абсолютные, без дублей и без заглушки", () => {
    const { trip } = nodes(tourJsonLd({ tour: { ...tour, gallery: [...tour.gallery, "/images/local.webp", NO_PHOTO] }, locale: "ru", labels }));
    expect(trip.image).toEqual([
      "https://api.kerben-travel.com/media/main.webp",
      "https://api.kerben-travel.com/media/2.webp",
      `${base}/images/local.webp`,
    ]);
    const { trip: bare } = nodes(tourJsonLd({ tour: { ...tour, image: NO_PHOTO, gallery: [] }, locale: "ru", labels }));
    expect(bare).not.toHaveProperty("image");
  });

  it("программа: пустые этапы пропускаются, пустой программы нет вовсе", () => {
    const { trip } = nodes(tourJsonLd({ tour, locale: "ru", labels }));
    expect(trip.itinerary).toEqual({
      "@type": "ItemList",
      numberOfItems: 2,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Бишкек → Нарын", description: "Выезд утром" },
        { "@type": "ListItem", position: 2, name: "Таш-Рабат" },
      ],
    });
    const { trip: empty } = nodes(tourJsonLd({ tour: { ...tour, itinerary: [] }, locale: "ru", labels }));
    expect(empty).not.toHaveProperty("itinerary");
  });

  it("хлебные крошки повторяют видимые: Главная → Туры → тур", () => {
    const { crumbs } = nodes(tourJsonLd({ tour, locale: "de", labels: { home: "Startseite", tours: "Touren" } }));
    expect(crumbs.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${base}/de` },
      { "@type": "ListItem", position: 2, name: "Touren", item: `${base}/de/tours` },
      { "@type": "ListItem", position: 3, name: tour.title, item: `${base}/de/tours/57` },
    ]);
  });

  it("сериализация экранирует < против XSS", () => {
    const html = serializeJsonLd({ "@context": "https://schema.org", name: "</script><script>alert(1)</script>" });
    expect(html).not.toContain("<");
    expect(JSON.parse(html)).toEqual({ "@context": "https://schema.org", name: "</script><script>alert(1)</script>" });
  });
});

const hotel: HotelItem = {
  id: "52",
  name: "Jannat Resort Osh",
  location: "Ош, Ошская область, Кыргызстан",
  description: "Курортный отель у подножия Сулайман-Тоо.",
  image: "https://api.kerben-travel.com/media/jannat.webp",
  gallery: ["https://api.kerben-travel.com/media/jannat-2.webp"],
  address: "ул. Айтиева, 1",
  phone: "+996 555 000 000",
  coords: [72.79, 40.53],
  price: 120,
  unit: "per_night",
  stars: 4,
  amenities: ["wifi", "pool"],
  rating: 0,
  reviews: 0,
};

const hotelLabels = { home: "Главная", hotels: "Отели" };

function hotelNodes(data: ReturnType<typeof hotelJsonLd>) {
  const graph = data["@graph"] as Record<string, unknown>[];
  return {
    lodging: graph.find((node) => node["@type"] === "LodgingBusiness") ?? {},
    crumbs: graph.find((node) => node["@type"] === "BreadcrumbList") ?? {},
  };
}

describe("JSON-LD страницы отеля", () => {
  it("отель — LodgingBusiness с адресом, координатами, фото и ценой с карточки бронирования", () => {
    const { lodging } = hotelNodes(hotelJsonLd({ hotel, locale: "ru", labels: hotelLabels, amenities: ["Wi-Fi", "Бассейн"], priceRange: "120 $ за ночь" }));
    expect(lodging).toEqual({
      "@type": "LodgingBusiness",
      "@id": `${base}/ru/hotels/52#lodging`,
      name: "Jannat Resort Osh",
      url: `${base}/ru/hotels/52`,
      description: "Курортный отель у подножия Сулайман-Тоо.",
      image: ["https://api.kerben-travel.com/media/jannat.webp", "https://api.kerben-travel.com/media/jannat-2.webp"],
      address: { "@type": "PostalAddress", streetAddress: "ул. Айтиева, 1", addressLocality: "Ош, Ошская область, Кыргызстан" },
      geo: { "@type": "GeoCoordinates", latitude: 40.53, longitude: 72.79 },
      priceRange: "120 $ за ночь",
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
        { "@type": "LocationFeatureSpecification", name: "Бассейн", value: true },
      ],
    });
  });

  it("пустые поля не попадают в разметку", () => {
    const bare = { ...hotel, description: " ", address: "", location: "", coords: null, image: NO_PHOTO, gallery: [] };
    const { lodging } = hotelNodes(hotelJsonLd({ hotel: bare, locale: "en", labels: hotelLabels, amenities: [] }));
    expect(Object.keys(lodging).sort()).toEqual(["@id", "@type", "name", "url"]);
  });

  it("хлебные крошки: Главная → Отели → отель", () => {
    const { crumbs } = hotelNodes(hotelJsonLd({ hotel, locale: "en", labels: { home: "Home", hotels: "Hotels" }, amenities: [] }));
    expect(crumbs.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/en` },
      { "@type": "ListItem", position: 2, name: "Hotels", item: `${base}/en/hotels` },
      { "@type": "ListItem", position: 3, name: "Jannat Resort Osh", item: `${base}/en/hotels/52` },
    ]);
  });
});

describe("JSON-LD главной: компания и сайт", () => {
  const contacts = {
    email: "kerbentravels@gmail.com",
    phone: "+996 705 120169",
    instagramHref: "https://www.instagram.com/kerben_travels",
    facebookHref: "https://www.facebook.com/profile.php?id=61553855528333",
  };
  const nodes = (data: ReturnType<typeof homeJsonLd>) => data["@graph"] as Record<string, unknown>[];

  it("TravelAgency: соцсети в sameAs и все написания бренда в alternateName", () => {
    const [agency] = nodes(homeJsonLd({ locale: "ru", contacts }));
    expect(agency).toEqual({
      "@type": "TravelAgency",
      "@id": ORGANIZATION_ID,
      name: "Kerben Travel",
      alternateName: ["Kerben Travels", "KerbenTravel", "Кербен Тревел", "凯尔本旅行"],
      url: `${base}/ru`,
      email: "kerbentravels@gmail.com",
      telephone: "+996 705 120169",
      areaServed: ["Kyrgyzstan", "Kazakhstan", "Uzbekistan"],
      sameAs: ["https://www.instagram.com/kerben_travels", "https://www.facebook.com/profile.php?id=61553855528333", "https://t.me/kerben_travels"],
    });
  });

  it("WebSite даёт Google название сайта и его варианты", () => {
    const [, site] = nodes(homeJsonLd({ locale: "zh", contacts }));
    expect(site).toEqual({
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: "Kerben Travel",
      alternateName: ["Kerben Travels", "KerbenTravel", "Кербен Тревел", "凯尔本旅行"],
      url: `${base}/`,
      inLanguage: "zh-CN",
      publisher: { "@id": ORGANIZATION_ID },
    });
  });

  it("без контактов из backend остаются имя, сайт, регион и Telegram-канал", () => {
    const [agency] = nodes(homeJsonLd({ locale: "en", contacts: { email: null, phone: null, instagramHref: null, facebookHref: null } }));
    expect(Object.keys(agency).sort()).toEqual(["@id", "@type", "alternateName", "areaServed", "name", "sameAs", "url"]);
    expect(agency.sameAs).toEqual(["https://t.me/kerben_travels"]);
  });
});
