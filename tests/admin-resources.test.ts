import { describe, expect, it } from "vitest";
import { getResource, MENU, RESOURCES, type ResourceKey } from "@/utils/admin/resources";

const REQUIRED: Partial<Record<ResourceKey, string[]>> = {
  tours: ["title", "price"],
  hotels: ["region_id", "district_id", "name", "price"],
  transports: ["name", "seats", "price"],
  helicopters: ["title", "price"],
  trekkings: ["title", "price"],
  tourImages: ["tour_id", "image"],
  tourPrograms: ["tour_id", "day_number"],
  hotelImages: ["hotel_id", "image"],
  transportImages: ["transport_id", "image"],
  helicopterImages: ["helicopter_id", "image"],
  trekkingImages: ["trekking_id", "image"],
  trekkingPrograms: ["trekking_id", "day_number"],
  categories: ["name"],
  countries: ["name"],
  regions: ["name"],
  districts: ["region_id", "name"],
  faqs: ["question", "answer"],
};

describe("разделы админки", () => {
  it.each(Object.entries(REQUIRED))("%s: обязательные поля backend помечены required", (key, names) => {
    const fields = RESOURCES[key as ResourceKey].fields;
    for (const name of names) expect(fields.find((f) => f.name === name)?.required, name).toBe(true);
  });

  it("getResource не отдаёт дочерние разделы и неизвестные ключи", () => {
    expect(getResource("tourImages")).toBeNull();
    expect(getResource("nope")).toBeNull();
    expect(getResource("transports")?.path).toBe("/transports/");
  });

  it("у дочернего раздела внешний ключ скрыт в форме, а родитель ссылается на него", () => {
    const tours = RESOURCES.tours;
    expect(tours.children?.map((c) => c.resource)).toEqual(["tourImages", "tourPrograms"]);
    for (const child of tours.children ?? []) {
      expect(RESOURCES[child.resource].fields.find((f) => f.name === child.foreignKey)?.hidden).toBe(true);
    }
  });

  it("в меню — все разделы, кроме дочерних, по одному разу", () => {
    const inMenu = MENU.flatMap((group) => group.items);
    const top = (Object.keys(RESOURCES) as ResourceKey[]).filter((key) => RESOURCES[key].group !== "child");
    expect([...inMenu].sort()).toEqual([...top].sort());
  });

  it("связи ведут на существующие разделы", () => {
    for (const def of Object.values(RESOURCES)) {
      for (const field of def.fields.filter((f) => f.type === "relation")) {
        expect(RESOURCES[field.relation as ResourceKey], `${def.key}.${field.name}`).toBeDefined();
      }
    }
  });
});
