"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { locales, switchLocaleInPath, type Locale } from "./config";

export function useLocalePrefetch(current: Locale) {
  const router = useRouter();
  const pathname = usePathname();
  const done = useRef("");

  return useCallback(() => {
    if (done.current === pathname) return;
    done.current = pathname;
    for (const code of locales) {
      if (code !== current) router.prefetch(switchLocaleInPath(pathname, code));
    }
  }, [current, pathname, router]);
}
