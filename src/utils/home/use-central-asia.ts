"use client";

import { useCallback, useState, type KeyboardEvent } from "react";

/** Фото флагов в порядке стран словаря: Кыргызстан, Казахстан, Узбекистан */
export const COUNTRY_FLAGS = ["/images/flags/kyrgyzstan.webp", "/images/flags/kazakhstan.webp", "/images/flags/uzbekistan.webp"] as const;

/** Где на фото флага главный знак (солнце): доли ширины и высоты. Эта точка ставится в центр блока */
export const FLAG_FOCUS: readonly [x: number, y: number][] = [
  [0.5, 0.483],
  [0.542, 0.4],
  [0.5, 0.5],
];

/**
 * Переключатель стран «Центральной Азии»: какая страна выбрана, клик и стрелки на клавиатуре.
 * Стрелки влево/вправо переводят выбор и фокус по кругу — как у обычных вкладок.
 */
export function useCentralAsia(count: number) {
  const [active, setActive] = useState(0);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next = (active + (event.key === "ArrowRight" ? 1 : count - 1)) % count;
      setActive(next);
      const buttons = event.currentTarget.parentElement?.querySelectorAll("button");
      buttons?.[next]?.focus();
    },
    [active, count],
  );

  return { active, select: setActive, onKeyDown };
}
