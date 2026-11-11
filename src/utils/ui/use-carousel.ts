"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCarousel<T extends HTMLElement = HTMLDivElement>(count: number, { wheel = false }: { wheel?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: true, end: count <= 1 });

  const onScroll = useCallback(() => {
    const track = ref.current;
    if (!track) return;
    const start = track.scrollLeft <= 4;
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("resize", onScroll);
    return () => window.removeEventListener("resize", onScroll);
  }, [onScroll, count]);

  useEffect(() => {
    const track = ref.current;
    if (!wheel || !track) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = track.scrollWidth - track.clientWidth;
      const next = track.scrollLeft + event.deltaY;
      if (max <= 0 || (event.deltaY < 0 && track.scrollLeft <= 0) || (event.deltaY > 0 && track.scrollLeft >= max - 1)) return;
      event.preventDefault();
      track.scrollLeft = Math.max(0, Math.min(max, next));
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [wheel, count]);

  const page = useCallback((direction: 1 | -1) => {
    const track = ref.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : track.clientWidth * 0.9;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  return { ref, atStart: edges.start, atEnd: edges.end, onScroll, prev: () => page(-1), next: () => page(1) };
}
