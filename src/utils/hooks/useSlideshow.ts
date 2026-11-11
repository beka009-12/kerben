"use client";

import { useCallback, useEffect, useState } from "react";

export function useSlideshow(count: number, intervalMs: number) {
  const [state, setState] = useState({ index: 0, previous: -1 });
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) =>
      setState((current) => {
        const index = ((next % count) + count) % count;
        return index === current.index ? current : { index, previous: current.index };
      }),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setState((current) => ({ index: (current.index + 1) % count, previous: current.index }));
      }
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, count, intervalMs, state.index]);

  return { index: state.index, previous: state.previous, paused, setPaused, goTo };
}
