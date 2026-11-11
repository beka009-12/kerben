import { describe, expect, it } from "vitest";
import { isApiTour, localizeTour, seedTours } from "./fixtures/demo-tours";
import { fromBackendTour, hasLocation, isBackendTour, splitList } from "@/utils/api/tours";

describe("API туров", () => {
  it("isApiTour отсеивает мусор из API", () => {
    expect(isApiTour(seedTours[0])).toBe(true);
    expect(isApiTour({ slug: "x" })).toBe(false);
    expect(isApiTour(null)).toBe(false);
  });

  it("localizeTour берёт перевод, а если его нет — английский", () => {
    const raw = { ...seedTours[0], summary: { en: "English only", ru: "" } };
    const tour = localizeTour(raw, "ru");
    expect(tour.title).toBe(raw.title.ru);
    expect(tour.summary).toBe("English only");
  });
});

describe("тур из backend", () => {
  const raw = {
    id: 12,
    category_id: null,
    title: "Сон-Куль на лошадях",
    description: "Три дня в седле. Ночёвка в юрте у озера.",
    included: "Проживание в юрте\nПитание; Гид",
    excluded: null,
    price: "450.00",
    price_unit: "per_person" as const,
    duration_days: 3,
    duration_nights: 2,
    min_people: 2,
    max_people: 8,
    tour_type: "adventure" as const,
    main_image: "/media/tours/son-kul.jpg",
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    images: [{ id: 1, tour_id: 12, image: "https://13.49.104.87/media/2.jpg", order: 1 }],
    programs: [
      { id: 2, tour_id: 12, day_number: 2, title: "Озеро", description: null, start_time: null, end_time: null },
      { id: 1, tour_id: 12, day_number: 1, title: "Бишкек → Кочкор", description: "Выезд утром", start_time: "09:00:00", end_time: null },
    ],
  };

  it("fromBackendTour переводит поля backend в тур сайта", () => {
    const tour = fromBackendTour(raw, "ru");
    expect(tour.slug).toBe("12");
    expect(tour.id).toBe(12);
    expect(tour.price).toBe(450);
    expect(tour.groupSize).toBe("2–8");
    expect(tour.category).toBe("adventure");
    expect(tour.image).toMatch(/^https?:\/\/.+\/media\/tours\/son-kul\.jpg$/);
    expect(tour.gallery).toEqual(["https://13.49.104.87/media/2.jpg"]);
    expect(tour.itinerary.map((s) => s.day)).toEqual(["1 · 09:00", "2"]);
    expect(tour.included).toEqual(["Проживание в юрте", "Питание", "Гид"]);
    expect(tour.reviews).toBe(0);
    expect(hasLocation(tour)).toBe(false);
  });

  it("isBackendTour отсеивает мусор", () => {
    expect(isBackendTour(raw)).toBe(true);
    expect(isBackendTour({ id: "x", title: "" })).toBe(false);
  });

  it("splitList не режет числа с запятой", () => {
    expect(splitList("Трансфер, ужин, 1,5 л воды")).toEqual(["Трансфер", "ужин", "1,5 л воды"]);
  });
});
