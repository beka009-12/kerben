"use client";

import { useMemo } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useFavoritesHydrated } from "@/utils/hooks/use-favorites-hydrated";
import { useFavorites } from "@/utils/store/favorites";
import type { Tour } from "@/types/tour";

export function useSavedList({ tours }: { tours: Tour[] }) {
  const { locale, dict } = useI18n();
  const slugs = useFavorites((state) => state.slugs);
  const clear = useFavorites((state) => state.clear);
  const hydrated = useFavoritesHydrated();
  const saved = useMemo(() => tours.filter((tour) => slugs.includes(tour.slug)), [tours, slugs]);

  return { locale, dict, clear, hydrated, saved };
}
