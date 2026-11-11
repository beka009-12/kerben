import type { MapMarker } from "@/utils/map/use-map-view";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import type { Region, Tour } from "@/types/tour";

export const inKyrgyzstan = ([lng, lat]: [number, number]) => lng > 69 && lng < 80.5 && lat > 39 && lat < 43.5;

export function tourMarkers(tours: Tour[], locale: Locale, labels: Dictionary["card"]): MapMarker[] {
  return tours.map((tour) => ({
    id: tour.slug,
    coords: tour.coords,
    title: `${tour.place}, ${tour.country}`,
    href: `/${locale}/tours/${tour.slug}`,
    card: {
      image: tour.image,
      title: tour.title,
      subtitle: `${tour.place}, ${tour.country}`,
      meta: `${tour.days} ${labels.days}`,
      rating: tour.rating,
      price: `${labels.from} ${formatPrice(tour.price, locale)}`,
      href: `/${locale}/tours/${tour.slug}`,
      cta: labels.details,
    },
  }));
}

export function countByRegion(tours: Tour[]): Partial<Record<Region, number>> {
  const counts: Partial<Record<Region, number>> = {};
  for (const tour of tours) counts[tour.region] = (counts[tour.region] ?? 0) + 1;
  return counts;
}
