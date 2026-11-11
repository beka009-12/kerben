"use client";

import { useEffect, useState } from "react";

/** Прокрутка вниз — true (шапка уезжает вверх), вверх — false (возвращается). У самого верха всегда видна. */
export function useHideOnScroll(top = 120, step = 6): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < top) {
        setHidden(false);
        last = y;
        return;
      }
      if (Math.abs(y - last) <= step) return;
      setHidden(y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [top, step]);

  return hidden;
}
