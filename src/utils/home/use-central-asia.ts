"use client";

import { useCallback, useEffect, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";

/** Фото флагов в порядке стран словаря: Кыргызстан, Казахстан, Узбекистан */
export const COUNTRY_FLAGS = ["/images/flags/kyrgyzstan.webp", "/images/flags/kazakhstan.webp", "/images/flags/uzbekistan.webp"] as const;

/** Где на фото флага главный знак (солнце): доли ширины и высоты. Эта точка ставится в центр блока */
export const FLAG_FOCUS: readonly [x: number, y: number][] = [
  [0.5, 0.483],
  [0.542, 0.4],
  [0.5, 0.5],
];

const ROTATE_MS = 6000;

/**
 * Переключатель стран «Центральной Азии»: какая страна выбрана, клик и стрелки на клавиатуре.
 * Стрелки влево/вправо переводят выбор и фокус по кругу — как у обычных вкладок.
 * Пока блок на экране (enabled), страны сменяются сами каждые ROTATE_MS. Автосмена стоит на паузе,
 * пока курсор над переключателем или фокус внутри блока, выключается после ручного выбора страны
 * и не запускается при «уменьшить движение».
 */
export function useCentralAsia(count: number, enabled: boolean) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!enabled || !auto || hovered || focused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % count), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, auto, hovered, focused, active, count]);

  const select = useCallback((index: number) => {
    setAuto(false);
    setActive(index);
  }, []);

  const hoverProps = {
    onPointerEnter: (event: PointerEvent) => event.pointerType === "mouse" && setHovered(true),
    onPointerLeave: () => setHovered(false),
  };

  const focusProps = {
    onFocus: () => setFocused(true),
    onBlur: (event: FocusEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    },
  };

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next = (active + (event.key === "ArrowRight" ? 1 : count - 1)) % count;
      select(next);
      const buttons = event.currentTarget.parentElement?.querySelectorAll("button");
      buttons?.[next]?.focus();
    },
    [active, count, select],
  );

  return { active, select, onKeyDown, hoverProps, focusProps };
}
