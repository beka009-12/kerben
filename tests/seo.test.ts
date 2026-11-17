import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { DEFAULT_OG_IMAGE, languageUrls, metaDescription, pageMetadata } from "@/utils/seo";

describe("SEO-метаданные", () => {
  it("базовый URL сайта — прод, без localhost", () => {
    expect(siteConfig.url).not.toMatch(/localhost/);
    expect(siteConfig.url).not.toMatch(/\/$/);
  });

  it("hreflang: все локали + x-default", () => {
    expect(languageUrls("/tours/48", "https://www.kerben-travel.com")).toEqual({
      en: "https://www.kerben-travel.com/en/tours/48",
      ru: "https://www.kerben-travel.com/ru/tours/48",
      de: "https://www.kerben-travel.com/de/tours/48",
      "zh-CN": "https://www.kerben-travel.com/zh/tours/48",
      "x-default": "https://www.kerben-travel.com/en/tours/48",
    });
  });

  it("короткое описание дополняется описанием раздела и обрезается до 160 символов", () => {
    expect(metaDescription("", "Раздел.")).toBe("Раздел.");
    expect(metaDescription("Бишкек", "Машины с водителем.")).toBe("Бишкек. Машины с водителем.");
    expect(metaDescription("Ала-Арча!", "Полёты.")).toBe("Ала-Арча! Полёты.");
    expect(metaDescription("伊塞克湖。", "本地旅行社。")).toBe("伊塞克湖。本地旅行社。");
    const long = metaDescription("слово ".repeat(60), "x");
    expect(long.length).toBeLessThanOrEqual(160);
    expect(long.endsWith("…")).toBe(true);
  });

  it("страница получает свои canonical, og:url, og:title и картинку по умолчанию", () => {
    const meta = pageMetadata({ locale: "ru", path: "/about", title: "О нас", description: "Кто мы" });
    expect(meta.alternates?.canonical).toBe("/ru/about");
    expect(meta.openGraph).toMatchObject({ url: "/ru/about", title: "О нас", description: "Кто мы", locale: "ru_RU", images: [DEFAULT_OG_IMAGE] });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", images: [DEFAULT_OG_IMAGE.url] });
  });

  it("своя картинка страницы заменяет картинку по умолчанию", () => {
    const meta = pageMetadata({ locale: "en", path: "/tours/48", title: "Tour", image: "https://api.kerben-travel.com/media/a.webp" });
    expect(meta.openGraph).toMatchObject({ images: [{ url: "https://api.kerben-travel.com/media/a.webp" }] });
  });
});
