import type { ListingGridItem, ListingGridLabels } from "@/components/common/listing-grid/ListingGrid";
import type { HelicopterItem, HotelItem, TransportItem, TrekkingItem } from "@/utils/api/catalog";
import { formatPrice, plural } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { fill } from "@/utils/offers";

const price = (amount: number, per: string | undefined, locale: Locale, dict: Dictionary) =>
  amount > 0 ? { from: dict.card.from, amount: formatPrice(amount, locale), per } : undefined;

/** Город из адреса вида «Район, Город, Страна» */
export function cityOf(location: string): string {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 2] : (parts[0] ?? "");
}

export function hotelItem(hotel: HotelItem, locale: Locale, dict: Dictionary): ListingGridItem {
  return {
    id: hotel.id,
    group: cityOf(hotel.location),
    price: hotel.price,
    card: {
      href: `/${locale}/hotels/${hotel.id}`,
      title: hotel.name,
      image: hotel.image,
      tag: dict.hotels.tag,
      meta: hotel.location ? { icon: "mapPin", text: hotel.location } : undefined,
      price: price(hotel.price, dict.units[hotel.unit] ?? dict.hotels.perNight, locale, dict),
    },
  };
}

export const seatsLabel = (seats: number, locale: Locale, dict: Dictionary) => fill(plural(seats, locale, dict.transport.seatForms), seats);

export function carItem(car: TransportItem, locale: Locale, dict: Dictionary): ListingGridItem {
  const seats = car.seats > 0 ? seatsLabel(car.seats, locale, dict) : undefined;
  return {
    id: String(car.id),
    group: seats,
    price: car.price,
    card: {
      href: `/${locale}/transport/${car.id}`,
      title: car.name,
      image: car.image,
      tag: car.hasDriver ? dict.transport.driver : dict.transport.noDriver,
      meta: seats ? { icon: "users", text: seats } : undefined,
      price: price(car.price, dict.units[car.unit], locale, dict),
    },
  };
}

export function flightItem(flight: HelicopterItem, locale: Locale, dict: Dictionary): ListingGridItem {
  return {
    id: String(flight.id),
    group: flight.route || undefined,
    price: flight.price,
    card: {
      href: `/${locale}/helicopter/${flight.id}`,
      title: flight.title,
      image: flight.image,
      tag: flight.route || undefined,
      meta: flight.minutes ? { icon: "clock", text: fill(dict.helicopter.minutes, flight.minutes) } : undefined,
      price: price(flight.price, dict.units[flight.unit], locale, dict),
    },
  };
}

export function trekItem(trek: TrekkingItem, locale: Locale, dict: Dictionary): ListingGridItem {
  return {
    id: String(trek.id),
    price: trek.price,
    card: {
      href: `/${locale}/trekking/${trek.id}`,
      title: trek.title,
      image: trek.image,
      meta: trek.days ? { icon: "clock", text: fill(dict.trekking.days, trek.days) } : undefined,
      price: price(trek.price, dict.units[trek.unit], locale, dict),
    },
  };
}

export function gridLabels(dict: Dictionary, all: string, sort: string): ListingGridLabels {
  return { all, filter: dict.tours.filters, sort, sortAsc: dict.tours.sorts.priceAsc, sortDesc: dict.tours.sorts.priceDesc };
}
