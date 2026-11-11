"use client";

import { useSyncExternalStore } from "react";
import { useFavorites } from "@/utils/store/favorites";

export function useFavoritesHydrated() {
  return useSyncExternalStore(
    (onChange) => useFavorites.persist.onFinishHydration(onChange),
    () => useFavorites.persist.hasHydrated(),
    () => false,
  );
}
