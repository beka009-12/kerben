import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HeaderTopbar } from "@/components/layout/header-topbar/HeaderTopbar";
import ru from "@/dictionaries/ru.json";
import { NO_CONTACTS, type SiteContacts } from "@/utils/api/contacts";

afterEach(cleanup);

const contacts: SiteContacts = {
  ...NO_CONTACTS,
  phone: "+996 705 120169",
  phoneHref: "tel:+996705120169",
  email: "kerbentravels@gmail.com",
  whatsappHref: "https://wa.me/996705120169",
  telegramHref: "https://t.me/+996705120169",
  instagramHref: "https://www.instagram.com/kerben_travels",
};

const labels = { contacts: ru.nav.contact, hours: ru.contact.hours, hoursText: ru.contact.hoursText };

describe("полоса контактов над шапкой", () => {
  it("телефон, почта, мессенджеры, часы работы и Instagram — сразу под рукой", () => {
    render(<HeaderTopbar contacts={contacts} labels={labels} />);
    const list = screen.getByRole("list", { name: "Контакты" });
    const links = within(list)
      .getAllByRole("link")
      .map((link) => [link.textContent, link.getAttribute("href")]);
    expect(links).toEqual([
      ["+996 705 120169", "tel:+996705120169"],
      ["kerbentravels@gmail.com", "mailto:kerbentravels@gmail.com"],
      ["WhatsApp", "https://wa.me/996705120169"],
      ["Telegram", "https://t.me/+996705120169"],
    ]);
    expect(screen.getByText("Пн–Сб, 9:00–19:00")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Instagram" }).getAttribute("href")).toBe("https://www.instagram.com/kerben_travels");
  });

  it("мессенджеры и соцсети открываются в новой вкладке, звонок и почта — нет", () => {
    render(<HeaderTopbar contacts={contacts} labels={labels} />);
    for (const name of ["WhatsApp", "Telegram", "Instagram"]) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
    expect(screen.getByRole("link", { name: "+996 705 120169" }).hasAttribute("target")).toBe(false);
  });

  it("без контактов из backend полоса остаётся, но без пустых ссылок", () => {
    const { container } = render(<HeaderTopbar contacts={NO_CONTACTS} labels={labels} />);
    expect(container.querySelector(".header-topbar")).toBeTruthy();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("Пн–Сб, 9:00–19:00")).toBeTruthy();
  });
});
