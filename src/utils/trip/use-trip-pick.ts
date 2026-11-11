"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { useChatTrip, useTrip, type TripPick } from "./trip-store";

export const SCROLL_PAUSE_MS = 900;

const TOUR_PATH = /^\/(en|ru|de|zh)\/tours\/[\w-]+$/;

export function tourFrom(from: string | null): string | null {
  return from && TOUR_PATH.test(from) ? from : null;
}

export function scrollToBlock(id: string) {
  const target = document.getElementById(id);
  if (typeof target?.scrollIntoView !== "function") return;
  const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
}

export function useTripPick(pick: TripPick, scrollTo?: string, tour?: TripPick) {
  const router = useRouter();
  const picked = useTrip(
    (state) => state.picks[pick.kind]?.key === pick.key && (!tour || !state.picks.tour || state.picks.tour.key === tour.key),
  );

  function toggle() {
    if (picked) {
      useTrip.getState().remove(pick.kind);
      return;
    }
    const trip = useTrip.getState();
    if (tour && trip.picks.tour?.key !== tour.key) {
      if (trip.picks.tour) trip.restart();
      trip.add(tour);
    }
    useTrip.getState().add(pick);

    const back = tourFrom(new URLSearchParams(window.location.search).get("from"));
    if (back) {
      setTimeout(() => router.push(`${back}#trip`), SCROLL_PAUSE_MS);
      return;
    }
    if (scrollTo) setTimeout(() => scrollToBlock(scrollTo), SCROLL_PAUSE_MS);
  }

  return { picked, toggle };
}

const noSubscribe = () => () => {};

export function useTourChosen(): boolean {
  const inTrip = useTrip((state) => Boolean(state.picks.tour));
  const fromTour = useSyncExternalStore(
    noSubscribe,
    () => tourFrom(new URLSearchParams(window.location.search).get("from")) !== null,
    () => false,
  );
  return inTrip || fromTour;
}

export function useTripHydration() {
  useEffect(() => {
    void useTrip.persist.rehydrate();
    void useChatTrip.persist.rehydrate();
  }, []);
}
