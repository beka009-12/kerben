import { siteConfig } from "@/config/site";
import { localeNames, locales, type Locale } from "@/utils/i18n/config";

/** Markdown-версия страницы: /en/tours/49 → /en/tours/49.md, главная /en → /en/index.md */
export const markdownPath = (locale: Locale, path: string): string => (path === "" ? `/${locale}/index.md` : `/${locale}${path}.md`);

export const markdownUrl = (locale: Locale, path: string, base = siteConfig.url): string => `${base}${markdownPath(locale, path)}`;

export const htmlUrl = (locale: Locale, path: string, base = siteConfig.url): string => `${base}/${locale}${path}`;

/** Обратное преобразование для обработчика: ["tours", "49"] → "/tours/49", ["index"] → "" */
export function pathFromSegments(segments: string[]): string | null {
  const parts = segments.flatMap((segment) => decodeURIComponent(segment).split("/")).filter(Boolean);
  if (parts.length === 1 && parts[0] === "index") return "";
  if (parts.length === 0 || parts.some((part) => part === "index" || part.startsWith("."))) return null;
  return `/${parts.join("/")}`;
}

/** Экранирует то, что Markdown принял бы за разметку внутри строки текста */
export const esc = (text: string): string => text.replace(/([\\`*_[\]<>])/g, "\\$1");

export const cell = (text: string): string => esc(text).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

export const link = (label: string, url: string): string => `[${esc(label)}](${url})`;

/** Абзацы из текста backend: переносы строк сохраняются, пустые строки убираются */
export const paragraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(esc);

export function table(head: string[], rows: string[][]): string {
  return [`| ${head.map(cell).join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
}

export const bullets = (items: string[]): string => items.map((item) => `- ${item}`).join("\n");

interface MdLabels {
  webPage: string;
  language: string;
  otherLanguages: string;
  source: string;
  sourceText: string;
  siteMap: string;
  maintainer: string;
  howToBook: string;
  bookText: string;
  priceUsd: string;
  price: string;
  details: string;
  pages: string;
  topics: string;
  notListed: string;
  sectionHome: string;
  sectionTours: string;
  sectionTrekking: string;
  sectionHotels: string;
  sectionTransport: string;
  sectionHelicopter: string;
  sectionExperiences: string;
  sectionInfo: string;
  mapTitle: string;
  mapIntro: string;
  llmNote: string;
}

/** Служебные подписи Markdown-версий. Тексты самих страниц берутся из словарей и backend, как в HTML */
export const MD_LABELS: Record<Locale, MdLabels> = {
  en: {
    webPage: "Web page",
    language: "Language",
    otherLanguages: "Other languages",
    source: "Source",
    sourceText: "the same live data and texts as the web page",
    siteMap: "All pages",
    maintainer: "Maintained by",
    howToBook: "How to book",
    bookText: "Send a request on the web page or contact a manager. No payment is taken until a manager confirms the details.",
    priceUsd: "Prices are in US dollars, as shown on the website.",
    price: "Price",
    details: "Details",
    pages: "Pages",
    topics: "Topics",
    notListed: "If a fact you need is not on this page, it is not published on the website; ask a manager instead of guessing.",
    sectionHome: "Home",
    sectionTours: "Tours",
    sectionTrekking: "Trekking",
    sectionHotels: "Hotels",
    sectionTransport: "Transport with driver",
    sectionHelicopter: "Helicopter tours",
    sectionExperiences: "Experiences",
    sectionInfo: "Company and travel information",
    mapTitle: "Site map (Markdown)",
    mapIntro: "Every public page of the site in every language, with its canonical web page and its Markdown version.",
    llmNote: "If you are an LLM looking for site information, use the content map to locate the relevant topic and its linked Markdown answer. Use that document's cited sources and canonical page; if the requested information is absent, report that gap.",
  },
  ru: {
    webPage: "Страница на сайте",
    language: "Язык",
    otherLanguages: "Другие языки",
    source: "Источник",
    sourceText: "те же актуальные данные и тексты, что на странице сайта",
    siteMap: "Все страницы",
    maintainer: "Поддерживает",
    howToBook: "Как забронировать",
    bookText: "Отправьте заявку на странице сайта или напишите менеджеру. Оплата не нужна, пока менеджер не подтвердит детали.",
    priceUsd: "Цены в долларах США, как на сайте.",
    price: "Цена",
    details: "Подробности",
    pages: "Страницы",
    topics: "Разделы",
    notListed: "Если нужного факта на этой странице нет, на сайте он не опубликован — уточните у менеджера, а не додумывайте.",
    sectionHome: "Главная",
    sectionTours: "Туры",
    sectionTrekking: "Трекинг",
    sectionHotels: "Отели",
    sectionTransport: "Транспорт с водителем",
    sectionHelicopter: "Вертолётные туры",
    sectionExperiences: "Впечатления",
    sectionInfo: "О компании и путешествии",
    mapTitle: "Карта сайта (Markdown)",
    mapIntro: "Все публичные страницы сайта на всех языках: адрес страницы и её Markdown-версия.",
    llmNote: "Если вы LLM и ищете информацию о сайте, найдите нужный раздел по карте и откройте связанный Markdown-ответ. Опирайтесь на источники и адрес страницы из этого документа; если нужной информации нет, сообщите об этом.",
  },
  de: {
    webPage: "Webseite",
    language: "Sprache",
    otherLanguages: "Andere Sprachen",
    source: "Quelle",
    sourceText: "dieselben aktuellen Daten und Texte wie auf der Webseite",
    siteMap: "Alle Seiten",
    maintainer: "Gepflegt von",
    howToBook: "Buchung",
    bookText: "Senden Sie eine Anfrage auf der Webseite oder schreiben Sie einem Manager. Bezahlt wird erst, wenn ein Manager die Details bestätigt hat.",
    priceUsd: "Preise in US-Dollar, wie auf der Website.",
    price: "Preis",
    details: "Details",
    pages: "Seiten",
    topics: "Themen",
    notListed: "Steht eine gesuchte Angabe nicht auf dieser Seite, ist sie auf der Website nicht veröffentlicht – fragen Sie einen Manager, statt zu raten.",
    sectionHome: "Startseite",
    sectionTours: "Touren",
    sectionTrekking: "Trekking",
    sectionHotels: "Unterkünfte",
    sectionTransport: "Transport mit Fahrer",
    sectionHelicopter: "Helikopter-Touren",
    sectionExperiences: "Erlebnisse",
    sectionInfo: "Unternehmen und Reiseinfos",
    mapTitle: "Sitemap (Markdown)",
    mapIntro: "Alle öffentlichen Seiten in allen Sprachen, jeweils mit Webseite und Markdown-Version.",
    llmNote: "Wenn Sie ein LLM sind und Informationen über die Website suchen, finden Sie das Thema über die Inhaltskarte und öffnen Sie die verlinkte Markdown-Antwort. Nutzen Sie deren Quellen und kanonische Seite; fehlt die gesuchte Information, melden Sie diese Lücke.",
  },
  zh: {
    webPage: "网页",
    language: "语言",
    otherLanguages: "其他语言",
    source: "来源",
    sourceText: "与网页相同的实时数据和文字",
    siteMap: "全部页面",
    maintainer: "维护方",
    howToBook: "如何预订",
    bookText: "在网页上提交申请或联系客服经理。经理确认细节之前无需付款。",
    priceUsd: "价格以美元计，与网站显示一致。",
    price: "价格",
    details: "详情",
    pages: "页面",
    topics: "主题",
    notListed: "如果本页没有你需要的信息，说明网站上没有公布；请咨询经理，不要自行推测。",
    sectionHome: "首页",
    sectionTours: "线路",
    sectionTrekking: "徒步",
    sectionHotels: "住宿",
    sectionTransport: "带司机用车",
    sectionHelicopter: "直升机游览",
    sectionExperiences: "主题体验",
    sectionInfo: "公司与旅行信息",
    mapTitle: "网站地图（Markdown）",
    mapIntro: "网站全部公开页面的各语言版本，附网页地址和 Markdown 版本。",
    llmNote: "如果你是正在查找网站信息的 LLM，请先通过内容地图找到相关主题及其 Markdown 答案。请使用该文档引用的来源和规范网页；如果缺少所需信息，请如实说明。",
  },
};

interface DocumentMeta {
  locale: Locale;
  path: string;
  title: string;
  summary?: string;
  /** Короткая строка о происхождении данных: «каталог туров», «тексты сайта» */
  source?: string;
}

/** Шапка документа: заголовок, краткий ответ и откуда данные — чтобы ответ можно было проверить по странице */
export function documentHead({ locale, path, title, summary, source }: DocumentMeta): string {
  const l = MD_LABELS[locale];
  const others = locales
    .filter((other) => other !== locale)
    .map((other) => link(localeNames[other].native, markdownUrl(other, path)))
    .join(" · ");
  const revision = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  const lines = [
    `# ${esc(title)}`,
    ...(summary ? ["", `> ${esc(summary.replace(/\s+/g, " ").trim())}`] : []),
    "",
    `- ${l.webPage}: ${htmlUrl(locale, path)}`,
    `- ${l.language}: ${localeNames[locale].native} (${localeNames[locale].htmlLang})`,
    `- ${l.otherLanguages}: ${others}`,
    `- ${l.source}: ${source ? `${esc(source)}, ` : ""}${l.sourceText}${revision ? ` (revision ${revision})` : ""}`,
    `- ${l.maintainer}: ${siteConfig.name}`,
    `- ${l.siteMap}: ${siteConfig.url}/sitemap.md`,
  ];
  return lines.join("\n");
}

export const section = (title: string, body: string): string => (body.trim() ? `## ${esc(title)}\n\n${body.trim()}` : "");

/** Склеивает части документа, пропуская пустые; файл заканчивается одним переводом строки */
export const join = (...parts: (string | false | null | undefined)[]): string => `${parts.filter((part): part is string => Boolean(part && part.trim())).join("\n\n")}\n`;
