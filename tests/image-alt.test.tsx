import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ListingCard } from "@/components/common/listing-card/ListingCard";
import { OfferCard } from "@/components/common/offer-card/OfferCard";
import { Infrastructure } from "@/components/home/infrastructure/Infrastructure";
import { CatalogCard, type CatalogCardLabels } from "@/components/tours/catalog-card/CatalogCard";
import { PhotoGallery } from "@/components/ui/photo-gallery/PhotoGallery";
import ru from "@/dictionaries/ru.json";
import type { Tour } from "@/types/tour";

vi.mock("next/image", () => ({ default: ({ src, alt }: { src: string; alt: string }) => <span data-testid="photo" data-src={src} data-alt={alt} /> }));

const alts = () => screen.getAllByTestId("photo").map((node) => node.getAttribute("data-alt"));

const tour: Tour = {
  id: 50,
  slug: "50",
  place: "Сон-Куль",
  title: "Сон-Куль: ночь в юрте",
  country: "Кыргызстан",
  summary: "",
  overview: "",
  region: "asia",
  coords: [74.77, 41.45],
  image: "https://api.kerben-travel.com/media/son-kul.webp",
  gallery: [],
  price: 300,
  rating: 0,
  reviews: 0,
  days: 3,
  groupSize: "1–8",
  difficulty: null,
  languages: [],
  category: "nature",
  badge: null,
  highlights: [],
  itinerary: [],
  included: [],
  excluded: [],
};

const catalogLabels: CatalogCardLabels = {
  from: "от",
  perPerson: "за человека",
  details: "Подробнее",
  days: "дня",
  durations: { one: "1 день", short: "2–3 дня", long: "4+ дней" },
  formats: { individual: "Индивидуальный", group: "Групповой" },
  groupUpTo: "до {n} человек",
};

describe("подписи фото", () => {
  afterEach(cleanup);

  it("карточки туров, отелей и предложений подписывают фото названием", () => {
    render(
      <>
        <CatalogCard tour={tour} locale="ru" labels={catalogLabels} />
        <ListingCard title="Hyatt Regency Bishkek" image="/h.webp" />
        <OfferCard title="Toyota Land Cruiser" image="/c.webp" />
      </>,
    );
    expect(alts()).toEqual(["Сон-Куль: ночь в юрте", "Hyatt Regency Bishkek", "Toyota Land Cruiser"]);
  });

  it("в галерее подписаны все кадры, а не только первый", () => {
    const labels = { photos: "Фотографии", photo: "Фото", close: "Закрыть", prev: "Назад", next: "Вперёд" };
    render(<PhotoGallery images={["/1.webp", "/2.webp", "/3.webp"]} name="Таш-Рабат" labels={labels} layout="mosaic" />);
    expect(alts()).toEqual(["Таш-Рабат", "Таш-Рабат — Фото 2", "Таш-Рабат — Фото 3"]);
  });

  it("фото юрточного лагеря на главной описано текстом из словаря", () => {
    render(<Infrastructure image="/yurts.webp" dict={ru} />);
    expect(alts()).toEqual([ru.home.infrastructure.imageAlt]);
  });
});
