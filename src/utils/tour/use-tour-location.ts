"use client";

import { useMemo } from "react";
import type { MapMarker } from "@/utils/map/use-map-view";
import { useI18n } from "@/utils/i18n/I18nProvider";
import type { Tour } from "@/types/tour";

export function useTourLocation({ itinerary }: { itinerary: Tour["itinerary"] }) {
  const { dict } = useI18n();
  const t = dict.tour;

  const markers = useMemo<MapMarker[]>(
    () =>
      itinerary.map((stage) => ({
        id: stage.day,
        coords: stage.coords,
        title: stage.title,
        label: `${t.day} ${stage.day}`,
        card: { title: stage.title, subtitle: `${t.day} ${stage.day}`, text: stage.text },
      })),
    [itinerary, t.day],
  );
  const route = useMemo(() => itinerary.map((stage) => stage.coords), [itinerary]);

  return { dict, t, markers, route };
}
