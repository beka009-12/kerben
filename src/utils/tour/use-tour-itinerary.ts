"use client";

import { useState } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";
import type { Tour } from "@/types/tour";

export const PREVIEW = 3;

export function useTourItinerary({ itinerary }: { itinerary: Tour["itinerary"] }) {
  const { dict } = useI18n();
  const t = dict.tour;
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? itinerary : itinerary.slice(0, PREVIEW);

  return { t, expanded, setExpanded, shown };
}
