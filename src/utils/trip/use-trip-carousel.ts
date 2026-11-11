"use client";

import { useI18n } from "@/utils/i18n/I18nProvider";
import { useCarousel } from "@/utils/ui/use-carousel";

export function useTripCarousel(count: number) {
  const { dict } = useI18n();
  const carousel = useCarousel(count);
  return { dict, ...carousel, scrollable: !(carousel.atStart && carousel.atEnd), total: dict.trip.options.replace("{total}", String(count)) };
}
