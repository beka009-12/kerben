import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { NO_PHOTO } from "@/data/images";
import type { Tour } from "@/types/tour";
import { ORGANIZATION_ID, serializeJsonLd, tourJsonLd } from "@/utils/structured-data";

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
