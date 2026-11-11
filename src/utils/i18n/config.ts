export const locales = ["en", "ru", "de", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, { short: string; full: string; native: string; htmlLang: string; intl: string }> = {
  en: { short: "EN", full: "English", native: "English", htmlLang: "en", intl: "en-US" },
  ru: { short: "RU", full: "Russian", native: "Русский", htmlLang: "ru", intl: "ru-RU" },
  de: { short: "DE", full: "German", native: "Deutsch", htmlLang: "de", intl: "de-DE" },
  zh: { short: "中文", full: "Chinese", native: "简体中文", htmlLang: "zh-CN", intl: "zh-CN" },
};

export function hasLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function switchLocaleInPath(pathname: string, next: Locale): string {
  const parts = pathname.split("/");
  if (hasLocale(parts[1])) {
    parts[1] = next;
    return parts.join("/") || `/${next}`;
  }
  return `/${next}${pathname === "/" ? "" : pathname}`;
}

export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter((item) => item.tag && !Number.isNaN(item.q) && item.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (hasLocale(base)) return base;
    if (base === "ky" || base === "kk" || base === "uz") return "ru";
  }
  return defaultLocale;
}
