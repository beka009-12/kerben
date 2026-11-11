"use client";

import { useEffect, useRef, useState } from "react";
import { tripStep } from "./trip-steps";
import { pickedList, useChatTrip, useTrip, type PickKind, type TripPick } from "./trip-store";

export function useTripReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = () => {
      if (useTrip.persist.hasHydrated() && useChatTrip.persist.hasHydrated()) setReady(true);
    };
    const offTrip = useTrip.persist.onFinishHydration(check);
    const offChat = useChatTrip.persist.onFinishHydration(check);
    check();
    return () => {
      offTrip();
      offChat();
    };
  }, []);

  return ready;
}

export const PICK_PAUSE_MS = 900;

function useShownStep(step: ReturnType<typeof tripStep>, pickedKeys: string) {
  const [shown, setShown] = useState(step);
  const lastKeys = useRef(pickedKeys);

  useEffect(() => {
    const picked = pickedKeys !== lastKeys.current && pickedKeys.length > lastKeys.current.length;
    lastKeys.current = pickedKeys;
    if (!picked) {
      setShown(step);
      return;
    }
    const timer = setTimeout(() => setShown(step), PICK_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [step, pickedKeys]);

  return shown;
}

export function useTripPlanner({ tour, hasHotels, hasCars }: { tour: TripPick; hasHotels: boolean; hasCars: boolean }) {
  const ready = useTripReady();
  const own = useTrip((state) => state.picks);
  const skips = useTrip((state) => state.skips);
  const other = Boolean(own.tour && own.tour.key !== tour.key);
  const picks: Partial<Record<PickKind, TripPick>> = other ? {} : own;

  const mySkips = other ? {} : skips;
  const pickedKeys = [picks.hotel?.key, picks.car?.key].filter(Boolean).join(",");
  const step = useShownStep(tripStep({ picks, skips: mySkips, hasHotels, hasCars }), pickedKeys);

  function addTour() {
    const trip = useTrip.getState();
    if (trip.picks.tour?.key === tour.key) return;
    if (trip.picks.tour) trip.restart();
    trip.add(tour);
  }

  return {
    ready,
    step,
    picked: pickedList(picks),
    hasTour: picks.tour?.key === tour.key,
    showHotels: hasHotels && !mySkips.hotel,
    showCars: hasCars && !mySkips.car,
    skip: (kind: "hotel" | "car") => {
      addTour();
      useTrip.getState().skip(kind);
    },
    change: () => useTrip.getState().restart(),
  };
}
