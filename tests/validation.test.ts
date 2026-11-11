import { describe, expect, it } from "vitest";
import { isContact, isEmail, isPhone, isValid, validateBooking, validateMessage } from "@/utils/validation";

const booking = { name: "Aida", phone: "+996 555 123 456", date: "2026-12-01", guests: 2, tour: "issyk-kul-lake-adventure" };

describe("validation", () => {
  it("проверяет email и телефон", () => {
    expect(isEmail("user@mail.kg")).toBe(true);
    expect(isEmail("user@mail")).toBe(false);
    expect(isContact("+996 555 123 456")).toBe(true);
    expect(isContact("12")).toBe(false);
    expect(isPhone("+996 (555) 12-34-56")).toBe(true);
    expect(isPhone("aida@mail.kg")).toBe(false);
  });

  it("бронь без даты и гостей проходит: в форме только имя, телефон и email", () => {
    expect(isValid(validateBooking({ name: "Aida", phone: "+996555123456", tour: "x" }))).toBe(true);
  });

  it("правильная бронь проходит проверку", () => {
    expect(isValid(validateBooking(booking, "2026-10-16"))).toBe(true);
  });

  it("бронь на прошедшую дату не проходит", () => {
    expect(validateBooking({ ...booking, date: "2026-01-01" }, "2026-10-16").date).toBe("pastDate");
  });

  it("пустая бронь — ошибки во всех обязательных полях", () => {
    const errors = validateBooking({});
    expect(Object.keys(errors).sort()).toEqual(["name", "phone", "tour"]);
  });

  it("email необязателен, но если указан — должен быть правильным", () => {
    expect(validateBooking({ ...booking, email: "" }, "2026-10-16").email).toBeUndefined();
    expect(validateBooking({ ...booking, email: "bad@" }, "2026-10-16").email).toBe("email");
  });

  it("сообщение короче 10 символов — ошибка", () => {
    expect(validateMessage({ name: "A", phone: "+996555123456", message: "hi" }).message).toBe("short");
  });

  it("сообщение без телефона не проходит (его требует backend)", () => {
    expect(validateMessage({ name: "A", email: "a@b.kg", message: "Хочу в тур на Сон-Куль" }).phone).toBe("required");
  });

  it("аренда машины: конец не может быть раньше начала", () => {
    const base = { name: "Aida", phone: "+996555123456", tour: "transport-1" };
    expect(validateBooking({ ...base, date: "2026-12-20", endDate: "2026-12-10" }, "2026-10-16").endDate).toBe("dateOrder");
    expect(validateBooking({ ...base, endDate: "2026-12-10" }, "2026-10-16").date).toBe("required");
    expect(isValid(validateBooking({ ...base, date: "2026-12-10", endDate: "2026-12-13" }, "2026-10-16"))).toBe(true);
  });
});
