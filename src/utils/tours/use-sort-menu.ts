"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

/**
 * Выпадающее меню сортировки: кнопка + список (role="listbox").
 * Клавиатура как у обычного select: стрелки, Home/End, Enter/пробел — выбрать, Esc — закрыть.
 */
export function useSortMenu<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (value: T) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const show = useCallback(() => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }, [options, value]);

  const close = useCallback((focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  }, []);

  const pick = useCallback(
    (option: T) => {
      onChange(option);
      close();
    },
    [onChange, close],
  );

  // Открылся список — фокус на него; клик мимо — закрыть
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  const onButtonKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      show();
    }
  };

  const onListKey = (event: KeyboardEvent) => {
    const last = options.length - 1;
    const moves: Record<string, number> = { ArrowDown: Math.min(active + 1, last), ArrowUp: Math.max(active - 1, 0), Home: 0, End: last };
    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(options[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close(false);
    }
  };

  const optionId = (index: number) => `${id}-option-${index}`;

  return {
    open,
    active,
    setActive,
    toggle: () => (open ? close() : show()),
    pick,
    rootRef,
    buttonRef,
    listRef,
    listId: `${id}-list`,
    optionId,
    onButtonKey,
    onListKey,
  };
}
