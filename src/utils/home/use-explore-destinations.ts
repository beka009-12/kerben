"use client";

import { useState } from "react";
import type { MapFocus, MapMarker } from "@/utils/map/use-map-view";
import { regions } from "@/data/content";
import { useI18n } from "@/utils/i18n/I18nProvider";
import type { Region } from "@/types/tour";

export const WORLD: MapFocus = { center: [40, 25], zoom: 1.1 };

export function useExploreDestinations({ counts }: Pick<{ markers: MapMarker[]; counts: Partial<Record<Region, number>> }, "counts">) {
  const { dict } = useI18n();
  const t = dict.explore;
  const [active, setActive] = useState<Region | null>(null);
  const available = regions
    .map((region) => ({ ...region, count: counts[region.key] ?? 0 }))
    .filter((region) => region.count > 0)
    .sort((a, b) => b.count - a.count);
  const total = available.reduce((sum, region) => sum + region.count, 0);
  const hasHidden = available.length < regions.length;
  const focus: MapFocus = active ? regions.find((r) => r.key === active) ?? WORLD : WORLD;

  return { t, active, setActive, available, total, hasHidden, focus };
}
