"use client";

import { useEffect, useRef, type MouseEvent, type TouchEvent } from "react";
import { useSlideshow } from "@/utils/hooks/useSlideshow";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useHeaderStore } from "@/utils/store/header";

export const FRAME_MS = 5000;

export function useStoryPanels() {
  const { locale, dict } = useI18n();
  const t = dict.story;
  const panels = t.panels;
  const { index: active, previous, setPaused, goTo } = useSlideshow(panels.length, FRAME_MS);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const href = `/${locale}/tours?q=${encodeURIComponent(locale === "ru" ? "Кыргызстан" : "Kyrgyzstan")}`;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const visible = new IntersectionObserver(([entry]) => setPaused(!entry?.isIntersecting), { threshold: 0.35 });
    const header = new IntersectionObserver(([entry]) => useHeaderStore.setState({ overDark: !!entry?.isIntersecting }), {
      rootMargin: "0px 0px -96% 0px",
    });
    visible.observe(stage);
    header.observe(stage);
    return () => {
      visible.disconnect();
      header.disconnect();
      useHeaderStore.setState({ overDark: false });
    };
  }, [setPaused]);

  function onStageClick(event: MouseEvent<HTMLDivElement>) {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    if ((event.target as HTMLElement).closest("a, button")) return;
    goTo(active + 1);
  }

  function onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function onTouchEnd(event: TouchEvent) {
    const from = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!from || !touch) return;
    const dx = touch.clientX - from.x;
    const dy = touch.clientY - from.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    swiped.current = true;
    goTo(active + (dx < 0 ? 1 : -1));
  }

  const panel = panels[active];

  return { t, panels, active, previous, goTo, stageRef, href, onStageClick, onTouchStart, onTouchEnd, panel };
}
