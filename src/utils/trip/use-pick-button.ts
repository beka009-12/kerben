"use client";

import { useI18n } from "@/utils/i18n/I18nProvider";
import type { TripPick } from "./trip-store";
import { useTourChosen, useTripPick } from "./use-trip-pick";

export interface PickButtonOptions {
  pick: TripPick;
  chooseLabel?: string;
  chosenLabel?: string;
  size?: "md" | "lg";
  block?: boolean;
  scrollTo?: string;
  tour?: TripPick;
  needsTour?: boolean;
}

export function usePickButton({ pick, chooseLabel, chosenLabel, size = "md", block = false, scrollTo, tour, needsTour = false }: PickButtonOptions) {
  const { dict } = useI18n();
  const { picked, toggle } = useTripPick(pick, scrollTo, tour);
  const tourChosen = useTourChosen();

  return {
    hidden: needsTour && !picked && !tourChosen,
    picked,
    toggle,
    className: ["pick-button", `pick-button-${size}`, block ? "pick-button-block" : "", picked ? "pick-button-on" : ""].filter(Boolean).join(" "),
    title: picked ? dict.trip.undo : undefined,
    label: picked ? (chosenLabel ?? dict.trip.chosen) : (chooseLabel ?? dict.trip.choose),
  };
}
