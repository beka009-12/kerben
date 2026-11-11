import type { HotelItem, TransportItem } from "@/utils/api/catalog";
import { formatNumber, formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { carPick, hotelPick } from "./trip-picks";
import type { TripPick } from "./trip-store";

export interface TripOffer {
  pick: TripPick;
  title: string;
  text: string;
  image: string;
  badge: string | null;
  stars: number;
  price: string | null;
  href: string;
}

const withFrom = (href: string, from?: string) => (from ? `${href}?from=${encodeURIComponent(from)}` : href);

export function hotelOffers(
  items: { hotel: HotelItem; km: number | null }[],
  locale: Locale,
  dict: Dictionary,
  from?: string,
): TripOffer[] {
  const t = dict.tour;
  return items.map(({ hotel, km }) => ({
    pick: hotelPick(hotel, locale, dict.units),
    title: hotel.name,
    text: hotel.location,
    image: hotel.image,
    badge: km !== null ? `${km < 1 ? "< 1" : formatNumber(Math.round(km), locale)} ${t.km} ${t.fromRoute}` : null,
    stars: hotel.stars,
    price: hotel.price > 0 ? `${formatPrice(hotel.price, locale)} / ${dict.units[hotel.unit] ?? t.perNight}` : null,
    href: withFrom(`/${locale}/hotels/${hotel.id}`, from),
  }));
}

export function carOffers(cars: TransportItem[], locale: Locale, dict: Dictionary, from?: string): TripOffer[] {
  return cars.map((car) => ({
    pick: carPick(car, locale, dict.units),
    title: car.name,
    text: [car.subtitle, dict.transport.seats.replace("{n}", String(car.seats))].filter(Boolean).join(" · "),
    image: car.image,
    badge: car.hasDriver ? dict.transport.driver : dict.transport.noDriver,
    stars: 0,
    price: car.price > 0 ? `${formatPrice(car.price, locale)} / ${dict.units[car.unit]}` : null,
    href: withFrom(`/${locale}/transport/${car.id}`, from),
  }));
}
