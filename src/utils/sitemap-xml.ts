import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/utils/i18n/config";
import { languageUrls } from "@/utils/seo";
import { DETAIL_PATH } from "@/utils/site-pages";

export type SitemapEntry = MetadataRoute.Sitemap[number];

export function sitemapEntries(paths: string[], base = siteConfig.url): SitemapEntry[] {
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: DETAIL_PATH.test(path) ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path.startsWith("/tours") ? 0.8 : DETAIL_PATH.test(path) ? 0.6 : 0.5,
      alternates: { languages: languageUrls(path, base) },
    })),
  );
}

/**
 * Подсказка для LLM и людей, где лежат Markdown-версии страниц. Это обычный XML-комментарий:
 * поисковики его пропускают, протокол sitemap не меняется. Внутри комментария нельзя «--».
 */
export const sitemapComment = (base = siteConfig.url) =>
  `<!-- Markdown guide for LLMs and readers: ${base}/llms.txt . Prose site map with a Markdown (.md) version of every page listed below: ${base}/sitemap.md . The canonical search URLs are the loc entries of this file. -->`;

/**
 * Тот же XML, что Next собирает из sitemap.ts (тест сверяет побайтно с его генератором),
 * плюс комментарий сразу после открывающего <urlset>. Поддержаны только поля, которые есть у сайта.
 */
export function sitemapXml(entries: SitemapEntry[], comment?: string): string {
  const hasAlternates = entries.some((item) => Object.keys(item.alternates?.languages ?? {}).length > 0);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${hasAlternates ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ""}>\n`;
  if (comment) xml += `${comment}\n`;
  for (const item of entries) {
    xml += "<url>\n";
    xml += `<loc>${item.url}</loc>\n`;
    for (const [language, href] of Object.entries(item.alternates?.languages ?? {})) {
      xml += `<xhtml:link rel="alternate" hreflang="${language}" href="${href}" />\n`;
    }
    if (item.lastModified) {
      xml += `<lastmod>${item.lastModified instanceof Date ? item.lastModified.toISOString() : item.lastModified}</lastmod>\n`;
    }
    if (item.changeFrequency) xml += `<changefreq>${item.changeFrequency}</changefreq>\n`;
    if (typeof item.priority === "number") xml += `<priority>${item.priority}</priority>\n`;
    xml += "</url>\n";
  }
  return `${xml}</urlset>\n`;
}
