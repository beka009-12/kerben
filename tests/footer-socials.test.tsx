import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/layout/footer/Footer";
import { siteConfig } from "@/config/site";
import ru from "@/dictionaries/ru.json";
import { NO_CONTACTS, type SiteContacts } from "@/utils/api/contacts";

vi.mock("next/image", () => ({ default: () => null }));

afterEach(cleanup);

const contacts: SiteContacts = {
  ...NO_CONTACTS,
  whatsappHref: "https://wa.me/996705120169",
  telegramHref: "https://t.me/+996705120169",
  instagramHref: "https://www.instagram.com/kerben_travels",
  facebookHref: "https://www.facebook.com/profile.php?id=61553855528333",
};

const href = (name: string) => screen.getByRole("link", { name }).getAttribute("href");

describe("соцсети в футере", () => {
  it("Telegram ведёт в канал из Taplink, а не в личный чат менеджера", () => {
    render(<Footer locale="ru" dict={ru} contacts={contacts} />);
    expect(siteConfig.telegramChannel).toBe("https://t.me/kerben_travels");
    expect(href("Telegram")).toBe("https://t.me/kerben_travels");
    expect(href("WhatsApp")).toBe("https://wa.me/996705120169");
    expect(href("Instagram")).toBe("https://www.instagram.com/kerben_travels");
    expect(href("Facebook")).toBe("https://www.facebook.com/profile.php?id=61553855528333");
  });

  it("канал показывается, даже если в backend нет Telegram", () => {
    render(<Footer locale="ru" dict={ru} contacts={{ ...contacts, telegramHref: null }} />);
    expect(href("Telegram")).toBe("https://t.me/kerben_travels");
  });
});
