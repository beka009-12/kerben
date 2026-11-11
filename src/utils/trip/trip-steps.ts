import type { BookingContext } from "@/utils/booking-chat";
import { pickedList, type PickKind, type SkipKind, type TripPick } from "./trip-store";

export type TripStep = "tour" | "hotel" | "car" | "done";

export function tripStep({
  picks,
  skips,
  hasHotels,
  hasCars,
}: {
  picks: Partial<Record<PickKind, TripPick>>;
  skips: Partial<Record<SkipKind, boolean>>;
  hasHotels: boolean;
  hasCars: boolean;
}): TripStep {
  if (!picks.hotel && !skips.hotel && hasHotels) return "hotel";
  if (!picks.car && !skips.car && hasCars) return "car";
  if (!picks.tour && !hasHotels && !hasCars) return "tour";
  return "done";
}

export function tripSummary(picks: Partial<Record<PickKind, TripPick>>, labels: Record<PickKind, string>): string {
  return pickedList(picks)
    .map((pick) => `${labels[pick.kind]}: ${pick.title}${pick.price > 0 ? ` (${pick.price} $${pick.unit ? ` ${pick.unit}` : ""})` : ""}`)
    .join("; ");
}

export function tripBooking(picks: Partial<Record<PickKind, TripPick>>, labels: Record<PickKind, string>): BookingContext | null {
  const list = pickedList(picks);
  if (list.length === 0) return null;
  const main = picks.tour ?? list[0];
  return {
    slug: list.length === 1 ? main.key : `trip-${main.key}`,
    title: list.map((pick) => `${labels[pick.kind]}: ${pick.title}`).join(" · "),
    id: list.length === 1 && main.kind === "tour" ? main.id : null,
    price: main.price,
    unit: main.unit,
    image: main.image,
    rental: Boolean(picks.car),
  };
}
