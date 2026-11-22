import { describe, expect, it } from "vitest";
// Генераторы самого Next — эталон: наши sitemap.xml и robots.txt должны совпадать с ними байт в байт, кроме комментариев
import { resolveRobots, resolveSitemap } from "next/dist/build/webpack/loaders/metadata/resolve-route-data";
import { siteConfig } from "@/config/site";
import en from "@/dictionaries/en.json";
import ru from "@/dictionaries/ru.json";
import type { Tour } from "@/types/tour";
import type { SiteContacts } from "@/utils/api/contacts";
import { tourDocument } from "@/utils/markdown/documents";
import { esc, markdownPath, markdownUrl, pathFromSegments } from "@/utils/markdown/md";
import { robotsComment, robotsRules, robotsTxt } from "@/utils/robots-txt";
import { sitemapComment, sitemapEntries, sitemapXml } from "@/utils/sitemap-xml";

const base = siteConfig.url;
const paths = ["", "/tours", "/experiences/lake", "/tours/49", "/hotels/45"];

const contacts: SiteContacts = {
  phone: "+996 705 120169",
  phoneHref: "tel:+996705120169",
  email: "kerbentravels@gmail.com",
  whatsappHref: "https://wa.me/996705120169",
  instagramHref: null,
  telegramHref: "https://t.me/+996705120169",
  facebookHref: null,
  address: "",
};

const tour: Tour = {
  id: 49,
  slug: "49",
  place: "Issyk-Kul",
  title: "Issyk-Kul: Northern Shore",
  country: "Kyrgyzstan",
  summary: "Two days on the northern shore of Issyk-Kul.",
  overview: "Two days on the northern shore of Issyk-Kul.\nSwimming in the warm mountain lake.",
  region: "asia",
  coords: [77, 42.6],
  image: "https://api.kerben-travel.com/media/49.webp",
  gallery: [],
  price: 195,
  rating: 0,
  reviews: 0,
  days: 2,
  nights: 1,
  groupSize: "1+",
  difficulty: null,
  languages: [],
  category: "nature",
  categoryName: "Lakes and Nature",
  badge: null,
  highlights: [],
  itinerary: [
    { day: "1", title: "Bishkek → Cholpon-Ata", text: "Petroglyphs *and* the beach", coords: [77, 42.6] },
    { day: "2", title: "", text: "", coords: [77, 42.6] },
  ],
  included: ["transport"],
  excluded: [],
};

describe("адреса Markdown-версий", () => {
  it("страница → .md рядом с ней, главная → /{lang}/index.md", () => {
    expect(markdownPath("en", "")).toBe("/en/index.md");
    expect(markdownPath("ru", "/tours/49")).toBe("/ru/tours/49.md");
    expect(markdownUrl("zh", "/faq")).toBe(`${base}/zh/faq.md`);
  });

  it("обработчик получает путь обратно; служебные и пустые сегменты не проходят", () => {
    expect(pathFromSegments(["index"])).toBe("");
    expect(pathFromSegments(["tours", "49"])).toBe("/tours/49");
    expect(pathFromSegments(["tours%2F49"])).toBe("/tours/49");
    expect(pathFromSegments([])).toBeNull();
    expect(pathFromSegments(["tours", "index"])).toBeNull();
    expect(pathFromSegments(["..", "admin"])).toBeNull();
  });

  it("разметка из текста backend экранируется", () => {
    expect(esc("a *b* [c](d) <e>")).toBe("a \\*b\\* \\[c\\](d) \\<e\\>");
  });
});

describe("sitemap.xml с подсказкой для LLM", () => {
  const entries = sitemapEntries(paths, base);

  it("без комментария — ровно тот XML, который собирал Next из sitemap.ts", () => {
    expect(sitemapXml(entries)).toBe(resolveSitemap(entries));
  });

  it("комментарий стоит внутри <urlset>, после XML-декларации, и не содержит «--»", () => {
    const xml = sitemapXml(entries, sitemapComment(base));
    const comment = sitemapComment(base);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset ')).toBe(true);
    expect(xml.indexOf(comment)).toBeGreaterThan(xml.indexOf("<urlset"));
    expect(comment.slice(4, -3)).not.toContain("--");
    expect(xml.replace(`${comment}\n`, "")).toBe(resolveSitemap(entries));
    expect(comment).toContain(`${base}/llms.txt`);
    expect(comment).toContain(`${base}/sitemap.md`);
  });

  it("каждый путь — на всех языках, с hreflang и x-default", () => {
    expect(entries).toHaveLength(paths.length * 4);
    expect(entries[0]).toMatchObject({ url: `${base}/en`, priority: 1, changeFrequency: "monthly" });
    expect(entries.find((item) => item.url === `${base}/de/tours/49`)).toMatchObject({ priority: 0.8, changeFrequency: "weekly" });
    expect(entries.find((item) => item.url === `${base}/zh/hotels/45`)?.alternates?.languages).toMatchObject({ "zh-CN": `${base}/zh/hotels/45`, "x-default": `${base}/en/hotels/45` });
  });
});

describe("robots.txt с подсказкой для LLM", () => {
  it("правила те же, что собирал Next из robots.ts; добавлены только строки-комментарии", () => {
    const rules = robotsRules(base);
    const text = robotsTxt(rules, robotsComment(base));
    expect(robotsTxt(rules)).toBe(resolveRobots(rules));
    const records = text.split("\n").filter((line) => !line.startsWith("#"));
    expect(records.join("\n").replace(/^\n+/, "")).toBe(resolveRobots(rules));
    expect(robotsComment(base).every((line) => line.startsWith("# "))).toBe(true);
    expect(text).toContain(`Sitemap: ${base}/sitemap.xml`);
    expect(text).not.toMatch(/^Sitemap: .*\.(md|txt)$/m);
  });
});

describe("Markdown-версия тура", () => {
  const doc = tourDocument({ locale: "en", dict: en, contacts }, tour);

  it("называет страницу, язык, другие языки и карту сайта", () => {
    expect(doc.startsWith("# Issyk-Kul: Northern Shore\n")).toBe(true);
    expect(doc).toContain(`- Web page: ${base}/en/tours/49`);
    expect(doc).toContain(`[Русский](${base}/ru/tours/49.md)`);
    expect(doc).toContain(`${base}/sitemap.md`);
  });

  it("факты — как на странице: длительность, ночи, цена за человека", () => {
    expect(doc).toContain("- **Duration:** 2 days");
    expect(doc).toContain("- **Nights:** 1 night");
    expect(doc).toContain("- **Price:** From $195 per person");
    expect(doc).not.toContain("Rating");
  });

  it("программа без пустых дней, текст backend экранирован", () => {
    expect(doc).toContain("### Day 1: Bishkek → Cholpon-Ata\n\nPetroglyphs \\*and\\* the beach");
    expect(doc).not.toContain("### Day 2");
    expect(doc).toContain("Swimming in the warm mountain lake.");
  });

  it("как забронировать: каналы из контактов и честная оговорка про цены", () => {
    expect(doc).toContain("[+996 705 120169](tel:+996705120169)");
    expect(doc).toContain("https://wa.me/996705120169");
    expect(doc).toContain("Prices are in US dollars");
    expect(doc.endsWith("_\n")).toBe(true);
  });

  it("русская версия на русском", () => {
    const ruDoc = tourDocument({ locale: "ru", dict: ru, contacts }, { ...tour, title: "Иссык-Куль: северный берег" });
    expect(ruDoc).toContain(`- Страница на сайте: ${base}/ru/tours/49`);
    expect(ruDoc).toContain("## Как забронировать");
  });
});
