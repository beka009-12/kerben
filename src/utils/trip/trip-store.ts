import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PickKind = "tour" | "hotel" | "car" | "helicopter" | "trekking";
export type SkipKind = "hotel" | "car";

export interface TripPick {
  kind: PickKind;
  key: string;
  title: string;
  id: number | null;
  image: string | null;
  price: number;
  unit: string | null;
  href: string | null;
}

interface TripState {
  picks: Partial<Record<PickKind, TripPick>>;
  skips: Partial<Record<SkipKind, boolean>>;
  lastAdded: { key: string; title: string; at: number } | null;
  add: (pick: TripPick) => void;
  remove: (kind: PickKind) => void;
  skip: (kind: SkipKind) => void;
  restart: () => void;
  clear: () => void;
}

export const PICK_ORDER: PickKind[] = ["tour", "hotel", "car", "trekking", "helicopter"];

export const useTrip = create<TripState>()(
  persist(
    (set) => ({
      picks: {},
      skips: {},
      lastAdded: null,
      add: (pick) =>
        set((state) => {
          const newTour = pick.kind === "tour" && state.picks.tour && state.picks.tour.key !== pick.key;
          const picks = { ...state.picks };
          if (newTour) {
            delete picks.hotel;
            delete picks.car;
          }
          return {
            picks: { ...picks, [pick.kind]: pick },
            skips: newTour ? {} : pick.kind === "hotel" || pick.kind === "car" ? { ...state.skips, [pick.kind]: false } : state.skips,
            lastAdded: { key: pick.key, title: pick.title, at: Date.now() },
          };
        }),
      remove: (kind) =>
        set((state) => {
          const picks = { ...state.picks };
          delete picks[kind];
          return { picks };
        }),
      skip: (kind) => set((state) => ({ skips: { ...state.skips, [kind]: true } })),
      restart: () =>
        set((state) => {
          const picks = { ...state.picks };
          delete picks.hotel;
          delete picks.car;
          return { picks, skips: {} };
        }),
      clear: () => set({ picks: {}, skips: {}, lastAdded: null }),
    }),
    {
      name: "kerben-trip",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ picks: state.picks, skips: state.skips }),
    },
  ),
);

export function pickedList(picks: Partial<Record<PickKind, TripPick>>): TripPick[] {
  return PICK_ORDER.flatMap((kind) => (picks[kind] ? [picks[kind]!] : []));
}

interface ChatTripState {
  picks: Partial<Record<PickKind, TripPick>>;
  sent: boolean;
  take: (picks: Partial<Record<PickKind, TripPick>>) => void;
  remove: (kind: PickKind) => void;
  markSent: () => void;
  clear: () => void;
}

export const useChatTrip = create<ChatTripState>()(
  persist(
    (set) => ({
      picks: {},
      sent: false,
      take: (picks) =>
        set((state) => {
          const otherTour = picks.tour && state.picks.tour && picks.tour.key !== state.picks.tour.key;
          return { picks: { ...(state.sent || otherTour ? {} : state.picks), ...picks }, sent: false };
        }),
      remove: (kind) =>
        set((state) => {
          const picks = { ...state.picks };
          delete picks[kind];
          return { picks };
        }),
      markSent: () => set({ sent: true }),
      clear: () => set({ picks: {}, sent: false }),
    }),
    {
      name: "kerben-chat-trip",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
