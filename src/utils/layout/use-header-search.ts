"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { searchTours, type SearchItem } from "@/utils/search";

export function useHeaderSearch({ items }: { items: SearchItem[] }) {
  const { locale, dict } = useI18n();
  const t = dict.search;
  const router = useRouter();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const deferred = useDeferredValue(query);

  const trimmed = deferred.trim();
  const results = useMemo(() => (trimmed ? searchTours(items, trimmed) : items.slice(0, 4)), [items, trimmed]);
  const base = `/${locale}`;
  const allHref = trimmed ? `${base}/tours?q=${encodeURIComponent(trimmed)}` : `${base}/tours`;
  const askHref = `${base}/chat?ask=${encodeURIComponent(trimmed)}`;

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    inputRef.current?.select();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function onInputKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[active];
      router.push(item ? `${base}/tours/${item.slug}` : allHref);
      close(false);
    }
  }

  const listId = `${uid}-results`;
  const optionId = (i: number) => `${uid}-option-${i}`;
  const heading = trimmed ? t.results : t.popular;

  return { locale, dict, t, open, setOpen, query, setQuery, active, setActive, inputRef, triggerRef, trimmed, results, base, allHref, askHref, close, onInputKey, listId, optionId, heading };
}
