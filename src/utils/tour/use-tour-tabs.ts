"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";

const ALL_SECTIONS = ["overview", "itinerary", "inclusions", "reviews", "location"] as const;
export type SectionId = (typeof ALL_SECTIONS)[number];

export function useTourTabs({ hide = [] }: { hide?: SectionId[] }) {
  const SECTIONS = ALL_SECTIONS.filter((id) => !hide.includes(id));
  const { dict } = useI18n();
  const [active, setActive] = useState<SectionId>("overview");
  const navRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<SectionId, HTMLAnchorElement>());
  const lockUntil = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (performance.now() < lockUntil.current) return;
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id as SectionId);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    const link = linkRefs.current.get(active);
    if (!strip || !link || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollTo({ left: link.offsetLeft - (strip.clientWidth - link.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  function goTo(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
    const nav = navRef.current;
    const target = document.getElementById(id);
    if (!nav || !target) return;
    event.preventDefault();
    const stickyTop = parseFloat(getComputedStyle(nav).top) || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - stickyTop - nav.offsetHeight - 16;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lockUntil.current = event.timeStamp + 900;
    setActive(id);
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  return { SECTIONS, dict, active, navRef, stripRef, linkRefs, goTo };
}
