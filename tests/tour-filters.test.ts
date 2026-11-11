import { describe, expect, it } from "vitest";
import { localizeTour, seedTours } from "./fixtures/demo-tours";
import { cleanTitle } from "@/utils/api/tours";
import { defaultFilters, durationOf, filterTours, filtersToParams, matchesTheme, readFilters, tripDays } from "@/utils/tour-filters";

const tours = seedTours.map((tour) => localizeTour(tour, "en"));

describe("filterTours", () => {
  it("без фильтров возвращает все туры", () => {
    expect(filterTours(tours, defaultFilters)).toHaveLength(tours.length);
  });

  it("ищет по названию и стране без учёта регистра", () => {
    const result = filterTours(tours, { ...defaultFilters, query: "KYRGYZ" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((tour) => tour.country === "Kyrgyzstan")).toBe(true);
  });

  it("фильтрует по категории и цене", () => {
    const result = filterTours(tours, { ...defaultFilters, category: "nature", maxPrice: 500 });
    expect(result.every((tour) => tour.category === "nature" && tour.price <= 500)).toBe(true);
  });

  it("сортирует по цене по возрастанию", () => {
    const prices = filterTours(tours, { ...defaultFilters, sort: "priceAsc" }).map((tour) => tour.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("ничего не находит по бессмысленному запросу", () => {
    expect(filterTours(tours, { ...defaultFilters, query: "zzzzzz" })).toEqual([]);
  });
});

describe("темы с главной: горы, озёра, …", () => {
  const base = tours[0];
  const make = (over: Partial<typeof base>) => ({ ...base, title: "Тур", summary: "", itinerary: [], categoryName: undefined, tourType: undefined, ...over });

  it("горы — по словам в названии и описании на любом языке", () => {
    expect(matchesTheme(make({ title: "Поход по ущелью Ала-Арча" }), "mountain")).toBe(true);
    expect(matchesTheme(make({ summary: "Glacier and mountain pass" }), "mountain")).toBe(true);
    expect(matchesTheme(make({ title: "Озеро Иссык-Куль" }), "mountain")).toBe(false);
  });

  it("озёра, кочевая культура, история", () => {
    expect(matchesTheme(make({ title: "Закат на Сон-Куле" }), "lake")).toBe(true);
    expect(matchesTheme(make({ summary: "Ночь в юрте у пастухов" }), "nomad")).toBe(true);
    expect(matchesTheme(make({ summary: "Башня Бурана и Шёлковый путь" }), "history")).toBe(true);
  });

  it("зима и приключения — ещё и по типу тура из админки", () => {
    expect(matchesTheme(make({ tourType: "winter" }), "winter")).toBe(true);
    expect(matchesTheme(make({ tourType: "adventure" }), "adventure")).toBe(true);
    expect(matchesTheme(make({ tourType: "classic" }), "winter")).toBe(false);
  });

  it("filterTours с темой оставляет только подходящие туры", () => {
    const list = [make({ slug: "a", title: "Горы Тянь-Шаня" }), make({ slug: "b", title: "Город" })];
    expect(filterTours(list, { ...defaultFilters, theme: "mountain" }).map((t) => t.slug)).toEqual(["a"]);
  });
});

describe("фильтры каталога по макету", () => {
  const base = tours[0];
  const make = (over: Partial<typeof base>) => ({ ...base, itinerary: [], ...over });
  const list = [
    make({ slug: "a", days: 1, price: 100, tourType: "classic", categoryName: "Национальный парк Ала-Арча" }),
    make({ slug: "b", days: 3, price: 150, tourType: "individual", categoryName: "Иссык-Кульская область" }),
    make({ slug: "c", days: 6, price: 400, tourType: "adventure", categoryName: "Иссык-Кульская область" }),
  ];
  const slugs = (f: Partial<typeof defaultFilters>) => filterTours(list, { ...defaultFilters, ...f }).map((t) => t.slug);

  it("длительность: 1 день, 2–3 дня, 4+ дня", () => {
    expect(durationOf(1)).toBe("one");
    expect(durationOf(3)).toBe("short");
    expect(durationOf(4)).toBe("long");
    expect(slugs({ durations: ["one", "long"] })).toEqual(["a", "c"]);
  });

  it("формат, цена «от — до» и направление", () => {
    expect(slugs({ formats: ["individual"] })).toEqual(["b"]);
    expect(slugs({ formats: ["group"] })).toEqual(["a", "c"]);
    expect(slugs({ minPrice: 120, maxPrice: 200 })).toEqual(["b"]);
    expect(slugs({ place: "Иссык-Кульская область" })).toEqual(["b", "c"]);
  });

  it("даты: остаются туры, которые помещаются в поездку", () => {
    expect(tripDays("2030-06-01", "2030-06-03")).toBe(3);
    expect(slugs({ from: "2030-06-01", to: "2030-06-03" })).toEqual(["a", "b"]);
  });

  it("фильтры живут в адресе страницы и читаются обратно", () => {
    const f = { ...defaultFilters, theme: "lake" as const, place: "Иссык-Кульская область", durations: ["short" as const], formats: ["group" as const], minPrice: 50, maxPrice: 300, from: "2030-06-01", to: "2030-06-05" };
    expect(readFilters(filtersToParams(f))).toEqual(f);
    expect(filtersToParams(defaultFilters).toString()).toBe("");
  });

  it("«ТЕСТ:» убирается из названий", () => {
    expect(cleanTitle("ТЕСТ: Ала-Арча")).toBe("Ала-Арча");
    expect(cleanTitle("Иссык-Куль")).toBe("Иссык-Куль");
  });
});
