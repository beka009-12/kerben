"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const REFRESH_EVERY_MS = 5 * 60 * 1000;
export const AWAY_MS = 2 * 60 * 1000;
const SKIP = /^\/[^/]+\/(chat|admin)(?:\/|$)/;

/** Сайт подтягивает свежие данные каталога: раз в 5 минут и после возврата на вкладку */
export function useAutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const skip = SKIP.test(pathname);

  useEffect(() => {
    if (skip) return;
    let last = Date.now();
    let hiddenAt = 0;
    const refresh = () => {
      last = Date.now();
      router.refresh();
    };
    const tick = () => {
      if (document.visibilityState === "visible" && Date.now() - last >= REFRESH_EVERY_MS) refresh();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt && Date.now() - hiddenAt >= AWAY_MS) refresh();
      hiddenAt = 0;
    };
    const timer = setInterval(tick, 30 * 1000);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [skip, router]);
}
