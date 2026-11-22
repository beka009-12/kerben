import "server-only";
import { siteConfig } from "@/config/site";
import { defaultLocale, localeNames, locales, type Locale } from "@/utils/i18n/config";
import { esc, htmlUrl, link, MD_LABELS, markdownUrl } from "./md";
import { loadSiteData, pageTitle, type SiteData } from "./pages";

type Topic = "home" | "tours" | "experiences" | "trekking" | "hotels" | "transport" | "helicopter" | "info";

const TOPICS: Topic[] = ["home", "tours", "experiences", "trekking", "hotels", "transport", "helicopter", "info"];

export function topicOf(path: string): Topic {
  if (path === "") return "home";
  const kind = path.split("/")[1];
  return (TOPICS as string[]).includes(kind) ? (kind as Topic) : "info";
}

const topicTitle = (locale: Locale, topic: Topic): string => {
  const l = MD_LABELS[locale];
  const titles: Record<Topic, string> = {
    home: l.sectionHome,
    tours: l.sectionTours,
    experiences: l.sectionExperiences,
    trekking: l.sectionTrekking,
    hotels: l.sectionHotels,
    transport: l.sectionTransport,
    helicopter: l.sectionHelicopter,
    info: l.sectionInfo,
  };
  return titles[topic];
};

interface MapEntry {
  path: string;
  title: string;
}

function localeSection(site: SiteData, paths: string[]): string {
  const { locale } = site;
  const entries: MapEntry[] = paths.flatMap((path) => {
    const title = pageTitle(site, path);
    return title ? [{ path, title }] : [];
  });
  const groups = TOPICS.map((topic) => {
    const items = entries.filter((entry) => topicOf(entry.path) === topic);
    if (items.length === 0) return "";
    const lines = items.map((entry) => `- ${link(entry.title, markdownUrl(locale, entry.path))} — ${htmlUrl(locale, entry.path)}`);
    return `### ${esc(topicTitle(locale, topic))}\n\n${lines.join("\n")}`;
  }).filter(Boolean);
  return `## ${localeNames[locale].native} (${localeNames[locale].htmlLang})\n\n${groups.join("\n\n")}`;
}

/** /sitemap.md: каждая публичная страница на каждом языке — Markdown-версия и адрес страницы */
export async function sitemapMarkdown(paths: string[]): Promise<string> {
  const sites = await Promise.all(locales.map(loadSiteData));
  const l = MD_LABELS[defaultLocale];
  const head = [
    `# ${siteConfig.name} — ${l.mapTitle}`,
    "",
    `> ${l.mapIntro}`,
    "",
    l.llmNote,
    "",
    `- llms.txt: ${siteConfig.url}/llms.txt`,
    `- XML sitemap: ${siteConfig.url}/sitemap.xml`,
    `- ${l.pages}: ${paths.length * locales.length} (${paths.length} × ${locales.length})`,
    ...locales.filter((locale) => locale !== defaultLocale).map((locale) => `- ${localeNames[locale].native}: ${MD_LABELS[locale].llmNote}`),
  ].join("\n");
  return `${[head, ...sites.map((site) => localeSection(site, paths))].join("\n\n")}\n`;
}

/** /llms.txt по предложению llmstxt.org: краткая справка о компании и прямые ссылки на Markdown-ответы */
export async function llmsTxt(): Promise<string> {
  const site = await loadSiteData(defaultLocale);
  const { dict, contacts } = site;
  const m = dict.meta;
  const en = (path: string) => markdownUrl(defaultLocale, path);
  const item = (label: string, url: string, about: string) => `- ${link(label, url)}: ${esc(about)}`;
  const profiles = [
    contacts.instagramHref && `Instagram ${contacts.instagramHref}`,
    contacts.facebookHref && `Facebook ${contacts.facebookHref}`,
    `Telegram ${siteConfig.telegramChannel}`,
    `2GIS ${siteConfig.twoGis.url} (${siteConfig.twoGis.rating} / 5)`,
  ].filter(Boolean);
  const contactLine = [
    contacts.phone && `phone and WhatsApp ${contacts.phone}`,
    contacts.email && `email ${contacts.email}`,
    `office in Bishkek, ${dict.contact.hoursText}`,
  ].filter(Boolean);

  return [
    `# ${siteConfig.name}`,
    "",
    `> ${m.description} Official website: ${siteConfig.url} (English, Russian, German, Chinese).`,
    "",
    `Contacts: ${contactLine.join("; ")}. Prices on the website are in US dollars; a booking is a request that a manager confirms before any payment.`,
    "",
    `Official profiles of ${siteConfig.name} (${siteConfig.alternateNames.join(", ")}): ${profiles.join("; ")}.`,
    "",
    "If you are an LLM looking for site information, use the content map to locate the relevant topic and its linked Markdown answer.",
    "Use that document's cited sources and canonical page; if the requested information is absent, report that gap.",
    "",
    "## Content maps",
    "",
    item(MD_LABELS.en.mapTitle, `${siteConfig.url}/sitemap.md`, MD_LABELS.en.mapIntro),
    item(m.toursTitle, en("/tours"), `${m.toursDescription} Each tour links to its own itinerary, inclusions and price.`),
    // Пустой раздел не рекламируем: описание обещало бы маршруты, которых пока нет
    ...(site.hotels.length > 0 ? [item(m.hotelsTitle, en("/hotels"), m.hotelsDescription)] : []),
    ...(site.cars.length > 0 ? [item(m.transportTitle, en("/transport"), m.transportDescription)] : []),
    ...(site.flights.length > 0 ? [item(m.helicopterTitle, en("/helicopter"), m.helicopterDescription)] : []),
    ...(site.treks.length > 0 ? [item(m.trekkingTitle, en("/trekking"), m.trekkingDescription)] : []),
    "",
    "## Key answers",
    "",
    item(m.contactTitle, en("/contact"), "Phone, WhatsApp, Telegram, email, office location, opening hours and the 2GIS rating."),
    item(m.faqTitle, en("/faq"), m.faqDescription),
    item(m.attractionsTitle, en("/attractions"), m.attractionsDescription),
    item(m.aboutTitle, en("/about"), m.aboutDescription),
    item(m.title, en(""), "Overview of the company, popular tours, experiences, seasons and Central Asia routes."),
    "",
    "## Other languages",
    "",
    ...locales
      .filter((locale) => locale !== defaultLocale)
      .map((locale) => item(`${localeNames[locale].native} (${localeNames[locale].htmlLang})`, markdownUrl(locale, ""), `${localeNames[locale].full} version of the site; its tours catalogue is ${markdownUrl(locale, "/tours")}`)),
    "",
    "## Optional",
    "",
    item(m.creditsTitle, en("/credits"), m.creditsDescription),
    item("XML sitemap", `${siteConfig.url}/sitemap.xml`, "Sitemap protocol file for search engines with hreflang alternates; the same pages as sitemap.md."),
    "",
  ].join("\n");
}
