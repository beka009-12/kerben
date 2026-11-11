import { describe, expect, it } from "vitest";
import { fieldErrorsFrom422, parseNumber, toFormValues, toPayload, validateValues } from "@/utils/admin/form";
import { RESOURCES } from "@/utils/admin/resources";

describe("форма админки", () => {
  it("toPayload при изменении отправляет только изменённые поля", () => {
    const heli = RESOURCES.helicopters;
    const original = toFormValues(heli, { id: 1, title: "Полёт", price: "1000.00", description: null, duration_minutes: 45 });
    const values = { ...original, title: "Полёт над Ала-Арчой" };
    expect(toPayload(heli, values, original)).toEqual({ title: "Полёт над Ала-Арчой" });
  });

  it("toPayload при создании: числа и цена — числа, пустые необязательные — null, boolean — boolean", () => {
    const values = { ...toFormValues(RESOURCES.transports, null), name: "Sprinter", seats: "18", price: "1 200,50", year: "" };
    expect(toPayload(RESOURCES.transports, values, null)).toMatchObject({
      name: "Sprinter",
      seats: 18,
      price: 1200.5,
      year: null,
      has_driver: true,
      is_active: true,
      price_unit: "per_day",
    });
  });

  it("toPayload: связь — число, пустая необязательная связь — null", () => {
    const values = { ...toFormValues(RESOURCES.tours, null), title: "Сон-Куль", price: "450", category_id: "3" };
    expect(toPayload(RESOURCES.tours, values, null)).toMatchObject({ category_id: 3 });
    expect(toPayload(RESOURCES.tours, { ...values, category_id: "" }, null)).toMatchObject({ category_id: null });
  });

  it("validateValues: обязательные и неверные числа", () => {
    const values = { ...toFormValues(RESOURCES.transports, null), name: "", seats: "abc", price: "" };
    expect(validateValues(RESOURCES.transports, values)).toEqual({
      name: "Обязательное поле",
      seats: "Введите число",
      price: "Обязательное поле",
    });
  });

  it("validateValues: дробное в целом поле", () => {
    const values = { ...toFormValues(RESOURCES.transports, null), name: "A", seats: "4,5", price: "10" };
    expect(validateValues(RESOURCES.transports, values)).toEqual({ seats: "Введите целое число" });
  });

  it("parseNumber", () => {
    expect(parseNumber("1 200,50")).toBe(1200.5);
    expect(parseNumber("  ")).toBeNull();
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNaN();
  });

  it("fieldErrorsFrom422 берёт имя поля из loc", () => {
    expect(
      fieldErrorsFrom422([
        { loc: ["body", "price"], msg: "Input should be a valid number" },
        { loc: ["query", "lang"], msg: "x" },
      ]),
    ).toEqual({ price: "Input should be a valid number" });
    expect(fieldErrorsFrom422("oops")).toEqual({});
  });

  it("список удобств отеля ↔ массив", () => {
    const hotels = RESOURCES.hotels;
    const values = toFormValues(hotels, { id: 1, name: "H", region_id: 1, district_id: 2, price: "50", amenities: ["Wi-Fi", "Завтрак"] });
    expect(values.amenities).toEqual(["Wi-Fi", "Завтрак"]);
    expect(toPayload(hotels, { ...values, amenities: ["Wi-Fi", " ", "Парковка"] }, values)).toEqual({ amenities: ["Wi-Fi", "Парковка"] });
  });

  it("цена из backend «1000.00» показывается как «1000» и без правки не отправляется", () => {
    const original = toFormValues(RESOURCES.transports, { id: 1, name: "A", seats: 4, price: "1000.00" });
    expect(original.price).toBe("1000");
    expect(toPayload(RESOURCES.transports, { ...original }, original)).toEqual({});
  });

  it("время программы «09:00:00» → «09:00»", () => {
    expect(toFormValues(RESOURCES.tourPrograms, { id: 1, tour_id: 2, day_number: 1, start_time: "09:00:00" }).start_time).toBe("09:00");
  });
});
