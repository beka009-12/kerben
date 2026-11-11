"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useFavorites } from "@/utils/store/favorites";

export const COMPOSER_MAX = 4000;

export type ComposerPanel = "closed" | "menu" | "templates" | "favorites";
export interface ComposerTour {
  slug: string;
  title: string;
  image?: string | null;
}

export function useAiComposer({
  onSend,
  streaming,
  initialValue,
  autoFocus,
  tours,
  sendEmpty = false,
}: {
  onSend: (text: string) => void;
  streaming: boolean;
  initialValue: string;
  autoFocus: boolean;
  tours: ComposerTour[];
  sendEmpty?: boolean;
}) {
  const { dict } = useI18n();
  const t = dict.ai.menu;
  const templates = dict.ai.templates;
  const labels = { favoritePrompt: t.favoritePrompt };
  const [value, setValue] = useState(initialValue);
  const [panel, setPanel] = useState<ComposerPanel>("closed");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLFormElement>(null);
  const savedSlugs = useFavorites((state) => state.slugs);

  const saved = useMemo(() => savedSlugs.flatMap((slug) => tours.filter((tour) => tour.slug === slug)), [savedSlugs, tours]);
  const slash = /^\/[^\n]*$/.test(value) ? value.slice(1).trim().toLocaleLowerCase() : null;
  const slashItems = slash === null ? [] : templates.filter((item) => item.title.toLocaleLowerCase().includes(slash));

  function resize() {
    const el = inputRef.current;
    if (!el) return;
    const max = Number.parseFloat(getComputedStyle(el).maxHeight) || 200;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }

  useEffect(() => {
    resize();
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (panel === "closed") return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setPanel("closed");
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [panel]);

  function insert(text: string) {
    setValue(text);
    setPanel("closed");
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      resize();
      el.focus();
      const start = text.indexOf("[");
      const end = text.indexOf("]", start);
      if (start >= 0 && end > start) el.setSelectionRange(start, end + 1);
      else el.setSelectionRange(text.length, text.length);
    });
  }

  function pickTour(title: string) {
    insert(labels.favoritePrompt.replace("{title}", title));
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const text = value.trim();
    if ((!text && !sendEmpty) || streaming || text.length > COMPOSER_MAX || slash !== null) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(resize);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (slash !== null && slashItems.length > 0) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActive((i) => (i + step + slashItems.length) % slashItems.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        insert(slashItems[Math.min(active, slashItems.length - 1)].prompt);
        return;
      }
    }
    if (event.key === "Escape") {
      if (slash !== null) setValue("");
      setPanel("closed");
      return;
    }
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }

  function onChange(next: string) {
    setValue(next);
    setActive(0);
    if (panel !== "closed") setPanel("closed");
    resize();
  }

  return {
    t,
    templates,
    value,
    panel,
    active,
    slash,
    slashItems,
    saved,
    inputRef,
    rootRef,
    canSend: Boolean(value.trim() || sendEmpty) && slash === null,
    setPanel,
    setActive,
    togglePanel: () => setPanel((p) => (p === "closed" ? "menu" : "closed")),
    insert,
    pickTour,
    submit,
    onKeyDown,
    onChange,
  };
}
