"use client";

import { useSearchParams } from "next/navigation";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { tourFrom } from "./use-trip-pick";

export function useBackLink(href: string, label: string) {
  const { dict } = useI18n();
  const fromTour = tourFrom(useSearchParams().get("from"));
  return { href: fromTour ? `${fromTour}#trip` : href, text: fromTour ? dict.trip.backToTour : label };
}
