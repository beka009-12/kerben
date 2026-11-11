"use client";

import { useEffect } from "react";
import { useRememberReturnPath } from "@/utils/layout/return-path";
import { migrateStorageKeys } from "@/utils/storage-keys";
import { startAuth } from "@/utils/store/auth";
import { useFavorites } from "@/utils/store/favorites";
import { useTripHydration } from "@/utils/trip/use-trip-pick";
import { useLiteMode } from "@/utils/ui/use-lite-mode";
import { useScrollReturn } from "@/utils/ui/use-scroll-return";

// До первого рендера: данные под старыми ключами KyrgyzGo переезжают под ключи Kerben Travel
if (typeof window !== "undefined") migrateStorageKeys();

export function useProviders() {
  useEffect(() => {
    void useFavorites.persist.rehydrate();
  }, []);

  useEffect(() => startAuth(), []);

  useTripHydration();
  useRememberReturnPath();
  useScrollReturn();
  useLiteMode();
}
