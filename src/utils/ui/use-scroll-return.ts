"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { restoreScroll, takeScroll } from "./scroll-memory";

export function useScrollReturn() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const y = takeScroll(pathname + window.location.search);
    if (y !== null) restoreScroll(y);
  }, [pathname]);
}
