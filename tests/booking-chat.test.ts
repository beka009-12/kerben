import { describe, expect, it } from "vitest";
import { splitBookingBlock } from "@/utils/booking-chat";

describe("booking block in an AI answer", () => {
  const block = '```booking\n{"title":"Сон-Куль","date":"2027-07-01","endDate":"empty","guests":"2","name":"Асан","phone":"+996 700 123 456","email":"none","message":""}\n```';

  it("splits text and draft, normalising empty words", () => {
    const { text, draft, pending } = splitBookingBlock(`Проверьте заявку:\n\n${block}`);
    expect(text).toBe("Проверьте заявку:");
    expect(pending).toBe(false);
    expect(draft).toMatchObject({ title: "Сон-Куль", date: "2027-07-01", endDate: "", guests: 2, email: "", phone: "+996 700 123 456" });
  });

  it("hides a block that is still streaming", () => {
    const { text, draft, pending } = splitBookingBlock('Готово!\n\n```booking\n{"name":"Ас');
    expect(text).toBe("Готово!");
    expect(draft).toBeNull();
    expect(pending).toBe(true);
  });

  it("leaves normal answers untouched", () => {
    expect(splitBookingBlock("Привет")).toEqual({ text: "Привет", draft: null, pending: false });
  });
});
