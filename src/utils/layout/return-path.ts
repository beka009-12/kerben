"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "kerben-return-to";
const CHAT = /^\/[^/]+\/chat(?:\/|$)/;

/** Последняя открытая страница сайта (не чат): туда ведёт «назад» из ИИ-чата */
export function useRememberReturnPath() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || CHAT.test(pathname)) return;
    try {
      sessionStorage.setItem(KEY, `${pathname}${window.location.search}`);
    } catch {
    }
  }, [pathname]);
}

export function readReturnPath(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    return value && value.startsWith("/") && !value.startsWith("//") && !CHAT.test(value) ? value : null;
  } catch {
    return null;
  }
}

/** Куда вернуться из чата; до загрузки в браузере — запасной адрес (главная) */
export function useReturnHref(fallback: string): string {
  const [href, setHref] = useState(fallback);
  useEffect(() => {
    const saved = readReturnPath();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setHref(saved);
  }, []);
  return href;
}
