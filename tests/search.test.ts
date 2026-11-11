import { describe, expect, it } from "vitest";
import { localizeTour, seedTours } from "./fixtures/demo-tours";
import { normalize, searchTours, toSearchItem } from "@/utils/search";

const items = seedTours.map((tour) => toSearchItem(localizeTour(tour, "ru")));

describe("мгновенный поиск", () => {
  it("normalize убирает регистр, дефисы и ё", () => {
    expect(normalize("Сон-Куль, Ёлка!")).toBe("сон куль елка");
  });

  it("находит тур по месту без учёта регистра и дефиса", () => {
    const found = searchTours(items, "иссык куль");
    expect(found.length).toBeGreaterThan(0);
    expect(found[0].text).toContain("иссык");
  });

  it("пустой запрос — пустой результат, мусор — ничего", () => {
    expect(searchTours(items, "   ")).toEqual([]);
    expect(searchTours(items, "zzzqqq")).toEqual([]);
  });
});
