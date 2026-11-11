"use client";

import { useI18n } from "@/utils/i18n/I18nProvider";
import type { TripOffer } from "@/utils/trip/trip-offers";
import type { PickKind, TripPick } from "@/utils/trip/trip-store";
import { useTripPlanner } from "@/utils/trip/use-trip-planner";

export function useTripPlannerSection({ tour, hotels, cars }: { tour: TripPick; hotels: TripOffer[]; cars: TripOffer[] }) {
  const { locale, dict } = useI18n();
  const t = dict.tour;
  const { ready, step, picked, hasTour, showHotels, showCars, skip, change } = useTripPlanner({ tour, hasHotels: hotels.length > 0, hasCars: cars.length > 0 });
  const kindLabels: Record<PickKind, string> = { tour: t.tripStepTour, hotel: t.tripStepHotel, car: t.tripStepCar, helicopter: dict.nav.helicopter, trekking: dict.nav.trekking };
  const choosing = step === "hotel" || step === "car";
  const isPicked = (kind: PickKind) => picked.some((pick) => pick.kind === kind);
  const base = [
    ...(showHotels ? [{ kind: "hotel" as const, title: t.hotelsTitle, offers: hotels, skip: t.tripSkipHotel, all: t.hotelsAll, href: `/${locale}/hotels` }] : []),
    ...(showCars ? [{ kind: "car" as const, title: t.tripCarTitle, offers: cars, skip: t.tripSkipCar, all: t.tripCarsAll, href: `/${locale}/transport` }] : []),
  ];
  const sections = base.map((section) => {
    const other = base.find((item) => item.kind !== section.kind && !isPicked(item.kind));
    return { ...section, scrollTo: other ? `trip-${other.kind}` : "trip", picked: isPicked(section.kind) };
  });
  const heading =
    step === "tour" ? { title: dict.trip.stepTitle, text: dict.trip.stepText } : choosing && sections[0] ? { title: sections[0].title, text: "" } : null;

  return { dict, t, ready, step, picked, hasTour, choosing, sections, heading, kindLabels, chatHref: `/${locale}/chat`, skip, change };
}
