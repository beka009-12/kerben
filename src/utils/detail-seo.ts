import type { HelicopterItem, HotelItem, TransportItem } from "@/utils/api/catalog";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { seatsLabel } from "@/utils/listing-items";
import { fill } from "@/utils/offers";
import { metaDescription } from "@/utils/seo";

const template = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);

/** «Without driver» → «without driver» внутри фразы. Немецкие существительные (Klimaanlage) остаются с большой буквы */
const lowerFirst = (text: string, locale: Locale, noun = false) => (noun && locale === "de" ? text : text.charAt(0).toLocaleLowerCase() + text.slice(1));

const priceFrom = (amount: number, per: string, locale: Locale, dict: Dictionary) =>
  amount > 0 ? lowerFirst(`${dict.card.from} ${formatPrice(amount, locale)} ${per}`.trim(), locale) : "";

/** Факты через запятую: «Toyota RAV4: 5 seats, without driver, from $70 per day.» */
const sentence = (head: string, parts: string[]) => {
  const body = parts.filter(Boolean).join(", ");
  return body ? `${head}: ${body}.` : `${head}.`;
};

interface Seo {
  title: string;
  description: string;
}

const DISTRICT = /district|район|rajon|区/i;
const REGION = /region|област|gebiet|州/i;

/**
 * Город из адреса backend. Бывает «Район, Город, Страна» и «Город, Область, Страна»:
 * в первом случае город посередине, во втором — первым. Если город не назван («Район, Область»), берём область.
 */
export function hotelCity(location: string): string {
  const parts = location
    .split(/[,，]/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "";
  const [first, middle] = parts;
  if (REGION.test(middle) && !DISTRICT.test(first)) return first;
  return middle;
}

/**
 * У большинства отелей в backend нет описания, и все отели одного района получали одинаковый description.
 * Теперь в нём имя отеля, адрес и цена, а дальше — тот же текст, что виден на странице вместо описания.
 */
export function hotelSeo(hotel: HotelItem, locale: Locale, dict: Dictionary): Seo {
  const t = dict.hotels;
  const city = hotelCity(hotel.location);
  const title = city && !hotel.name.toLowerCase().includes(city.toLowerCase()) ? template(dict.meta.hotelTitle, { name: hotel.name, city }) : hotel.name;
  const names = t.amenities as Record<string, string>;
  const own =
    hotel.description.trim() ||
    `${sentence(`${hotel.name}, ${hotel.location || hotel.address}`, [
      ...hotel.amenities.slice(0, 4).map((key) => names[key] ?? key),
      priceFrom(hotel.price, dict.units[hotel.unit] ?? t.perNight, locale, dict),
    ])} ${t.aboutFallback}`;
  return { title, description: metaDescription(own, dict.meta.hotelsDescription) };
}

export function carSeo(car: TransportItem, locale: Locale, dict: Dictionary): Seo {
  const t = dict.transport;
  const title = template(car.hasDriver ? dict.meta.carTitle : dict.meta.carTitleSelf, { name: car.name });
  const own =
    car.description.trim() ||
    `${sentence(car.name, [
      car.seats > 0 ? seatsLabel(car.seats, locale, dict) : "",
      lowerFirst(car.hasDriver ? t.driver : t.noDriver, locale),
      car.hasAirConditioner ? lowerFirst(t.ac, locale, true) : "",
      priceFrom(car.price, dict.units[car.unit] ?? "", locale, dict),
    ])} ${t.aboutFallback}`;
  return { title, description: metaDescription(own, dict.meta.transportDescription) };
}

export function flightSeo(flight: HelicopterItem, locale: Locale, dict: Dictionary): Seo {
  const t = dict.helicopter;
  const own =
    flight.description.trim() ||
    `${sentence(flight.title, [
      flight.route,
      flight.minutes ? fill(t.minutes, flight.minutes) : "",
      flight.passengers ? lowerFirst(`${t.passengersLabel} ${fill(t.upTo, flight.passengers)}`, locale, true) : "",
      priceFrom(flight.price, dict.units[flight.unit] ?? "", locale, dict),
    ])} ${t.aboutFallback}`;
  return { title: flight.title, description: metaDescription(own, dict.meta.helicopterDescription) };
}

export function contactDescription(dict: Dictionary, phone: string | null): string {
  const text = template(dict.meta.contactDescription, { phone: phone ?? "", hours: dict.contact.hoursText });
  return phone ? text : text.replace(/\s+([,，])/g, "$1");
}
