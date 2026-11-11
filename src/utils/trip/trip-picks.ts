import type { PriceUnit } from "@/utils/api/backend";
import type { HotelItem, TransportItem, TrekkingItem } from "@/utils/api/catalog";
import type { Tour } from "@/types/tour";
import type { TripPick } from "./trip-store";

type Units = Partial<Record<PriceUnit, string>>;

export function tourPick(tour: Pick<Tour, "slug" | "title" | "id" | "image" | "price">, locale: string): TripPick {
  return { kind: "tour", key: `tour-${tour.slug}`, title: tour.title, id: tour.id, image: tour.image, price: tour.price, unit: null, href: `/${locale}/tours/${tour.slug}` };
}

export function hotelPick(hotel: HotelItem, locale: string, units: Units): TripPick {
  return { kind: "hotel", key: `hotel-${hotel.id}`, title: hotel.name, id: null, image: hotel.image, price: hotel.price, unit: units[hotel.unit] ?? null, href: `/${locale}/hotels/${hotel.id}` };
}

export function carPick(car: TransportItem, locale: string, units: Units): TripPick {
  return { kind: "car", key: `transport-${car.id}`, title: car.name, id: null, image: car.image, price: car.price, unit: units[car.unit] ?? null, href: `/${locale}/transport/${car.id}` };
}

export function trekkingPick(trek: TrekkingItem, locale: string, units: Units): TripPick {
  return { kind: "trekking", key: `trekking-${trek.id}`, title: trek.title, id: null, image: trek.image, price: trek.price, unit: units[trek.unit] ?? null, href: `/${locale}/trekking/${trek.id}` };
}
