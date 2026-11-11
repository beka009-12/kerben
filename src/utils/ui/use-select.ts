"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

const GAP = 6;

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  tone?: string;
}

export function useSelect<T extends string>({
  value,
  options,
  onChange,
  variant,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (next: T) => void;
  variant: "field" | "pill";
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const current = options.find((o) => o.value === value) ?? options[0];
  const tone = (option: SelectOption<T>) => (option.tone ? ` ${option.tone}` : "");

  function show() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function close(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) trigger.current?.focus({ preventScroll: true });
  }

  function pick(next: T) {
    close();
    if (next !== value) onChange(next);
  }

  function place(): boolean {
    const box = trigger.current?.getBoundingClientRect();
    const list = menu.current;
    if (!box || !list) return false;
    if (box.bottom < 0 || box.top > window.innerHeight) return false;
    if (variant === "field") list.style.minWidth = `${box.width}px`;
    const height = list.offsetHeight;
    const width = list.offsetWidth;
    const below = box.bottom + GAP + height <= window.innerHeight - 8;
    const left = variant === "pill" ? box.right - width : box.left;
    list.style.top = `${below ? box.bottom + GAP : Math.max(8, box.top - GAP - height)}px`;
    list.style.left = `${Math.min(Math.max(8, left), window.innerWidth - width - 8)}px`;
    list.dataset.side = below ? "bottom" : "top";
    return true;
  }

  useLayoutEffect(() => {
    if (!open) return;
    place();
    menu.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false);
    };
    const follow = () => {
      if (!place()) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onTriggerKey(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      show();
    }
  }

  function onMenuKey(event: KeyboardEvent) {
    const last = options.length - 1;
    const moves: Record<string, number> = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: last };
    if (event.key in moves) {
      event.preventDefault();
      setActive(Math.min(last, Math.max(0, moves[event.key])));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(options[active].value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Tab") {
      close(false);
    }
  }

  return { id, trigger, menu, open, active, setActive, current, tone, show, close, pick, onTriggerKey, onMenuKey };
}
