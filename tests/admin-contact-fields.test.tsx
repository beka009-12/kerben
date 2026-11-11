import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminField } from "@/components/admin/admin-field/AdminField";
import { validateValues } from "@/utils/admin/form";
import { joinPhone, splitPhone } from "@/utils/admin/phone";
import { RESOURCES } from "@/utils/admin/resources";

describe("контакты в админке", () => {
  it("телефон делится на код страны и номер", () => {
    expect(splitPhone("+996 700 123 456")).toEqual({ code: "+996", number: "700 123 456" });
    expect(splitPhone("+7 701 000 00 00")).toEqual({ code: "+7", number: "701 000 00 00" });
    expect(splitPhone("700123456")).toEqual({ code: "+996", number: "700123456" });
    expect(joinPhone("+998", "90 123 45 67")).toBe("+998 90 123 45 67");
    expect(joinPhone("+998", " ")).toBe("");
  });

  it("WhatsApp — только ссылка, QR-кода больше нет", () => {
    const def = RESOURCES.contacts;
    expect(def.fields.some((f) => f.name === "qr_code")).toBe(false);
    expect(validateValues(def, { whatsapp: "+996 700 123 456" }).whatsapp).toMatch(/ссылка/);
    expect(validateValues(def, { whatsapp: "https://wa.me/996700123456" }).whatsapp).toBeUndefined();
  });

  it("у города есть подсказки: «Бишкек» в списке", () => {
    const city = RESOURCES.contacts.fields.find((f) => f.name === "city")!;
    const { container } = render(<AdminField field={city} value="Б" onChange={() => {}} />);
    expect([...container.querySelectorAll("datalist option")].map((o) => o.getAttribute("value"))).toContain("Бишкек");
  });

  it("числовое поле: «+» и «−» меняют значение, не ниже нуля", () => {
    const onChange = vi.fn();
    const field = RESOURCES.tours.fields.find((f) => f.name === "duration_days")!;
    const { rerender } = render(<AdminField field={field} value="3" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Больше: Дней" }));
    expect(onChange).toHaveBeenLastCalledWith("4");
    rerender(<AdminField field={field} value="0" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Меньше: Дней" }));
    expect(onChange).toHaveBeenLastCalledWith("0");
  });
});
