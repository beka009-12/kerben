import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const robotsRules = (base = siteConfig.url) =>
  ({
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/*/saved", "/*/requests", "/*/trips", "/*/login", "/*/chat", "/*/admin", "/*/reset-password"] },
    sitemap: `${base}/sitemap.xml`,
  }) satisfies MetadataRoute.Robots;

/** Только строки-комментарии: правила для роботов они не меняют, а LLM и людям показывают Markdown-карту сайта */
export const robotsComment = (base = siteConfig.url) => [
  `# Markdown guide for LLMs and readers: ${base}/llms.txt`,
  `# Prose site map with a Markdown (.md) version of every public page: ${base}/sitemap.md`,
];

const list = (value: string | string[] | undefined) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

/** Те же записи, что Next собирает из robots.ts (тест сверяет побайтно), с комментариями в начале файла */
export function robotsTxt(data: MetadataRoute.Robots, comment: string[] = []): string {
  let text = comment.length > 0 ? `${comment.join("\n")}\n\n` : "";
  for (const rule of Array.isArray(data.rules) ? data.rules : [data.rules]) {
    for (const agent of list(rule.userAgent ?? "*")) text += `User-Agent: ${agent}\n`;
    for (const path of list(rule.allow)) text += `Allow: ${path}\n`;
    for (const path of list(rule.disallow)) text += `Disallow: ${path}\n`;
    text += "\n";
  }
  for (const url of list(data.sitemap)) text += `Sitemap: ${url}\n`;
  return text;
}
