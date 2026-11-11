import { describe, expect, it } from "vitest";
import { managerContacts, managerMessage, telegramUrl, telegramUsername, whatsappNumber, whatsappUrl } from "@/utils/contact/manager";

describe("контакты менеджера", () => {
  it("WhatsApp: номер приводится к цифрам с кодом страны", () => {
    expect(whatsappNumber("+996 (555) 12-34-56")).toBe("996555123456");
    expect(whatsappNumber("00996555123456")).toBe("996555123456");
    expect(whatsappNumber("https://wa.me/996555123456")).toBe("996555123456");
  });

  it("WhatsApp: пусто, заглушка и неполный номер — кнопки нет", () => {
    expect(whatsappNumber("")).toBeNull();
    expect(whatsappNumber(undefined)).toBeNull();
    expect(whatsappNumber("+996 000 000 000")).toBeNull();
    expect(whatsappNumber("12345")).toBeNull();
  });

  it("Telegram: username из имени, @имени и прямой ссылки", () => {
    expect(telegramUsername("kerben_manager")).toBe("kerben_manager");
    expect(telegramUsername("@kerben_manager")).toBe("kerben_manager");
    expect(telegramUsername("https://t.me/kerben_manager")).toBe("kerben_manager");
  });

  it("Telegram: ссылки пересылки, чужие сайты и неверные имена не принимаются", () => {
    expect(telegramUsername("https://t.me/share/url?url=x")).toBeNull();
    expect(telegramUsername("https://example.invalid/telegram/01")).toBeNull();
    expect(telegramUsername("ab")).toBeNull();
    expect(telegramUsername("")).toBeNull();
  });

  it("ссылки: wa.me с закодированным текстом и прямой t.me", () => {
    const text = managerMessage("Здравствуйте! Меня интересует тур „{title}“. {url}", "Башня Бурана", "https://site.kg/ru/tours/12");
    expect(text).toBe("Здравствуйте! Меня интересует тур „Башня Бурана“. https://site.kg/ru/tours/12");
    const url = whatsappUrl("996555123456", text);
    expect(url.startsWith("https://wa.me/996555123456?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(text);
    expect(url).not.toMatch(/\s/);
    expect(telegramUrl("kerben_manager")).toBe("https://t.me/kerben_manager");
  });

  it("без настроек оба контакта пустые", () => {
    expect(managerContacts({ whatsapp: "", telegram: "" })).toEqual({ whatsapp: null, telegram: null });
  });
});
