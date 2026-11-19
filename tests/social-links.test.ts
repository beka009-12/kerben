import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

import { cleanLink, loadContacts } from "@/utils/api/contacts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ссылки на соцсети без трекинга", () => {
  it("убирает метки шаринга, но оставляет то, что задаёт страницу", () => {
    expect(cleanLink("https://www.instagram.com/kerben_travels?dmpr=bHhvZHYzNHp3cXoy&utm_source=qr")).toBe("https://www.instagram.com/kerben_travels");
    expect(cleanLink("https://www.facebook.com/share/17vcjdi88m/?mibextid=wwXIfr")).toBe("https://www.facebook.com/share/17vcjdi88m/");
    expect(cleanLink("https://www.facebook.com/profile.php?id=61553855528333&mibextid=wwXIfr&rdid=Zs90")).toBe(
      "https://www.facebook.com/profile.php?id=61553855528333",
    );
    expect(cleanLink("https://instagram.com/kerben_travels/?igsh=MWx0")).toBe("https://instagram.com/kerben_travels/");
    expect(cleanLink("не ссылка")).toBe("не ссылка");
  });

  it("контакты из backend приходят на сайт уже чистыми", async () => {
    const contact = {
      id: 1,
      country: "Кыргызстан",
      city: "Бишкек",
      phone: "+996 705 120169",
      whatsapp: "+996705120169",
      email: "kerbentravels@gmail.com",
      instagram: "https://www.instagram.com/kerben_travels?dmpr=bHhvZHYzNHp3cXoy&utm_source=qr",
      facebook: "https://www.facebook.com/share/17vcjdi88m/?mibextid=wwXIfr",
      telegram: "+996705120169",
      address: null,
      is_active: true,
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([contact]), { headers: { "Content-Type": "application/json" } })));
    const contacts = await loadContacts("ru");
    expect(contacts.instagramHref).toBe("https://www.instagram.com/kerben_travels");
    expect(contacts.facebookHref).toBe("https://www.facebook.com/share/17vcjdi88m/");
    expect(contacts.telegramHref).toBe("https://t.me/+996705120169");
  });
});
