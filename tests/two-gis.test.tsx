import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactInfo } from "@/components/contact/contact-info/ContactInfo";
import { Footer } from "@/components/layout/footer/Footer";
import { siteConfig } from "@/config/site";
import en from "@/dictionaries/en.json";
import ru from "@/dictionaries/ru.json";
import { NO_CONTACTS } from "@/utils/api/contacts";
import type { Dictionary } from "@/utils/i18n/dictionaries";

vi.mock("next/image", () => ({ default: () => null }));

afterEach(cleanup);

const CARD = "https://2gis.kg/bishkek/firm/70000001086785636";

describe("отзывы в 2ГИС", () => {
  it("карточка 2ГИС — без поиска и координат карты в адресе", () => {
    expect(siteConfig.twoGis.url).toBe(CARD);
  });

  it("на странице контактов под адресом — рейтинг со ссылкой на отзывы", () => {
    render(<ContactInfo dict={ru as unknown as Dictionary} contacts={NO_CONTACTS} locale="ru" />);
    const link = screen.getByRole("link", { name: "Рейтинг 4,9 из 5 в 2ГИС, открыть отзывы" });
    expect(link.getAttribute("href")).toBe(CARD);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.textContent).toBe("4,9 в 2ГИС");
  });

  it("в футере тот же рейтинг, числа по правилам языка", () => {
    render(<Footer locale="en" dict={en as unknown as Dictionary} contacts={NO_CONTACTS} />);
    const link = screen.getByRole("link", { name: "Rated 4.9 out of 5 on 2GIS, open reviews" });
    expect(link.getAttribute("href")).toBe(CARD);
    expect(link.textContent).toBe("4.9 on 2GIS");
  });
});
