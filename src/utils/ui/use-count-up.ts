"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";

const DURATION_MS = 1400;

/**
 * «28 000+» → набегает 0 … 28 000+ за полторы секунды, когда run стал true.
 * Текст без цифр и режим «уменьшить движение» — сразу итоговое значение.
 */
export function useCountUp(value: string, run: boolean, locale: Locale): string {
  const target = Number(value.replace(/\D/g, ""));
  const suffix = value.trim().match(/[^\d\s]+$/)?.[0] ?? "";
  const countable = target > 0 && /^\s*[\d\s.,]+\s*\D*$/.test(value);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!run || !countable) return;
    // «Уменьшить движение» — первый же кадр ставит итоговое число
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : DURATION_MS;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      setCurrent(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, countable, target]);

  // До показа карточки спрятаны — оставляем итоговое число (его же видят поисковики и скринридеры)
  if (!countable || !run) return value;
  return `${formatNumber(current, locale)}${suffix}`;
}
