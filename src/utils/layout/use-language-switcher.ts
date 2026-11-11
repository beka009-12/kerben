"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { localeNames, locales, switchLocaleInPath, type Locale } from "@/utils/i18n/config";
import { rememberLocale } from "@/utils/i18n/remember-locale";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useLocalePrefetch } from "@/utils/i18n/use-locale-prefetch";

export function useLanguageSwitcher() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const prefetch = useLocalePrefetch(locale);
  const names = useMemo(() => new Intl.DisplayNames([localeNames[locale].intl], { type: "language" }), [locale]);

  function change(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    rememberLocale(next);
    const target = switchLocaleInPath(pathname, next) + window.location.search + window.location.hash;
    startTransition(() => router.push(target, { scroll: false }));
  }

  useEffect(() => {
    if (!open) return;
    itemsRef.current[locales.indexOf(locale)]?.focus();
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, locale]);

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const items = itemsRef.current;
    const current = items.findIndex((item) => item === document.activeElement);
    const focus = (i: number) => items[(i + items.length) % items.length]?.focus();
    if (event.key === "ArrowDown") focus(current + 1);
    else if (event.key === "ArrowUp") focus(current - 1);
    else if (event.key === "Home") focus(0);
    else if (event.key === "End") focus(items.length - 1);
    else if (event.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === "Tab") setOpen(false);
    else return;
    event.preventDefault();
  }

  return { locale, dict, pending, open, setOpen, rootRef, buttonRef, itemsRef, prefetch, names, change, onMenuKey };
}
