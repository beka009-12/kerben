import { cacheLife, cacheTag } from "next/cache";
import { NO_PHOTO } from "@/data/images";
import type { Locale } from "@/utils/i18n/config";
import { backendFetch, backendImage, backendPrice, hasSiteAccount, type PriceUnit } from "./backend";
import { ApiError } from "./client";

async function loadList<T>(path: string, locale?: Locale): Promise<T[]> {
  const url = locale ? `${path}${path.includes("?") ? "&" : "?"}lang=${locale}` : path;
  try {
    return await loadListCached<T>(url);
  } catch (error) {
    console.warn(`[catalog] ${url} unavailable:`, error instanceof Error ? error.message : error);
    return [];
  }
}

export async function loadListCached<T>(url: string): Promise<T[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const data = await backendFetch<unknown>(url).catch((error: unknown) => {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return [];
    throw error;
  });
  return Array.isArray(data) ? (data as T[]) : [];
}

async function loadDetailCached<T>(url: string): Promise<T> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return backendFetch<T>(url);
}

async function withDetails<T extends { id: number }>(path: string, list: T[], locale: Locale): Promise<T[]> {
  if (!hasSiteAccount() || list.length === 0) return list;
  const full = await Promise.all(
    list.map((item) =>
      loadDetailCached<Partial<T>>(`${path}${item.id}/?lang=${locale}`).catch((error: unknown) => {
        console.warn(`[catalog] ${path}${item.id}/ unavailable:`, error instanceof Error ? error.message : error);
        return null;
      }),
    ),
  );
  return list.map((item, i) => ({ ...item, ...(full[i] ?? {}) }));
}

interface WithActive {
  is_active?: boolean;
}
const active = <T extends WithActive>(list: T[]) => list.filter((item) => item.is_active !== false);

interface BackendImage {
  id: number;
  image: string;
  order: number;
}

function groupImages<T extends BackendImage>(list: T[], key: keyof T): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (const item of [...list].sort((a, b) => a.order - b.order || a.id - b.id)) {
    const src = backendImage(item.image);
    const owner = item[key] as unknown as number;
    if (!src) continue;
    map.set(owner, [...(map.get(owner) ?? []), src]);
  }
  return map;
}

/** Фото только из backend: главное + галерея. Если backend фото не прислал — одна нейтральная заглушка */
function backendPictures(main: string | null | undefined, extra: string[] = []) {
  const set = [...new Set([backendImage(main), ...extra].filter((src): src is string => !!src))];
  return { image: set[0] ?? NO_PHOTO, gallery: set.slice(1) };
}

interface BackendCountry {
  id: number;
  name: string;
}
interface BackendRegion {
  id: number;
  name: string;
  image: string | null;
  country_id: number | null;
}
interface BackendDistrict {
  id: number;
  region_id: number;
  name: string;
}
interface BackendCategory {
  id: number;
  name: string;
  image: string | null;
}

async function placeName(regionId: number | null, districtId: number | null, locale: Locale): Promise<string> {
  const [countries, regions, districts] = await Promise.all([
    loadList<BackendCountry>("/countries/", locale),
    loadList<BackendRegion>("/regions/", locale),
    loadList<BackendDistrict>("/districts/", locale),
  ]);
  const district = districts.find((d) => d.id === districtId);
  const region = regions.find((r) => r.id === (regionId ?? district?.region_id));
  const country = countries.find((c) => c.id === region?.country_id);
  return [district?.name, region?.name, country?.name].filter(Boolean).join(", ");
}

export async function getTourCategoryNames(locale: Locale): Promise<Map<number, string>> {
  const list = await loadList<BackendCategory>("/tour-categories/", locale);
  return new Map(list.map((c) => [c.id, c.name]));
}

interface BackendHotel extends WithActive {
  id: number;
  region_id: number;
  district_id: number;
  name: string;
  description: string | null;
  address: string | null;
  price: string;
  price_unit: PriceUnit;
  stars: number | null;
  phone: string | null;
  latitude?: string | null;
  longitude?: string | null;
  amenities: unknown[] | null;
  main_image: string | null;
}

export interface HotelItem {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  gallery: string[];
  address: string;
  phone: string;
  coords: [number, number] | null;
  price: number;
  unit: PriceUnit;
  stars: number;
  amenities: string[];
  rating: number;
  reviews: number;
}

const AMENITY_KEYS: [RegExp, string][] = [
  [/wi-?fi|вай-?фай|интернет/i, "wifi"],
  [/pool|бассейн/i, "pool"],
  [/spa|спа|сауна|sauna/i, "spa"],
  [/breakfast|завтрак/i, "breakfast"],
  [/parking|парковк/i, "parking"],
  [/beach|пляж/i, "beach"],
  [/mountain|вид на горы|горы/i, "mountainView"],
];

function amenityKey(value: unknown): string {
  const text = String(value ?? "").trim();
  return AMENITY_KEYS.find(([pattern]) => pattern.test(text))?.[1] ?? text;
}

function toCoords(lng: string | null | undefined, lat: string | null | undefined): [number, number] | null {
  const x = Number.parseFloat(lng ?? "");
  const y = Number.parseFloat(lat ?? "");
  return Number.isFinite(x) && Number.isFinite(y) && (x !== 0 || y !== 0) ? [x, y] : null;
}

export async function getHotels(locale: Locale): Promise<HotelItem[]> {
  const [list, images] = await Promise.all([loadList<BackendHotel>("/hotels/", locale), loadList<BackendImage & { hotel_id: number }>("/hotel-images/")]);
  const hotels = await withDetails("/hotels/", active(list), locale);
  if (hotels.length === 0) return [];
  const byHotel = groupImages(images, "hotel_id");
  return Promise.all(
    hotels.map(async (h) => ({
      id: String(h.id),
      name: h.name,
      location: (await placeName(h.region_id, h.district_id, locale)) || h.address || "",
      description: h.description ?? "",
      ...backendPictures(h.main_image, byHotel.get(h.id)),
      address: h.address ?? "",
      phone: h.phone ?? "",
      coords: toCoords(h.longitude, h.latitude),
      price: backendPrice(h.price),
      unit: h.price_unit ?? "per_night",
      stars: Math.max(0, Math.min(5, h.stars ?? 0)),
      amenities: [...new Set((h.amenities ?? []).map(amenityKey).filter(Boolean))],
      rating: 0,
      reviews: 0,
    })),
  );
}

export async function getHotel(locale: Locale, id: string): Promise<HotelItem | null> {
  const hotels = await getHotels(locale);
  return hotels.find((h) => h.id === id) ?? null;
}

interface BackendTransport extends WithActive {
  id: number;
  name: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  seats: number;
  description: string | null;
  price: string;
  price_unit: PriceUnit;
  has_driver: boolean;
  has_air_conditioner: boolean;
  main_image: string | null;
}

export interface TransportItem {
  id: number;
  name: string;
  subtitle: string;
  model: string;
  color: string;
  description: string;
  image: string;
  gallery: string[];
  seats: number;
  year: number | null;
  hasDriver: boolean;
  hasAirConditioner: boolean;
  price: number;
  unit: PriceUnit;
}

export async function getTransports(locale: Locale): Promise<TransportItem[]> {
  const [list, images] = await Promise.all([
    loadList<BackendTransport>("/transports/", locale),
    loadList<BackendImage & { transport_id: number }>("/transport-images/"),
  ]);
  const byTransport = groupImages(images, "transport_id");
  const transports = active(await withDetails("/transports/", list, locale));
  return transports.map((t) => ({
    id: t.id,
    name: t.name,
    subtitle: [[t.brand, t.model].filter(Boolean).join(" "), t.color].filter(Boolean).join(" · "),
    model: [t.brand, t.model].filter(Boolean).join(" "),
    color: t.color ?? "",
    description: t.description ?? "",
    ...backendPictures(t.main_image, byTransport.get(t.id)),
    seats: t.seats,
    year: t.year,
    hasDriver: t.has_driver,
    hasAirConditioner: t.has_air_conditioner,
    price: backendPrice(t.price),
    unit: t.price_unit ?? "per_day",
  }));
}

interface BackendHelicopter extends WithActive {
  id: number;
  title: string;
  description: string | null;
  price: string;
  price_unit?: PriceUnit;
  duration_minutes?: number | null;
  max_passengers?: number | null;
  departure_location?: string | null;
  destination?: string | null;
  main_image?: string | null;
}

export interface HelicopterItem {
  id: number;
  title: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  unit: PriceUnit;
  minutes: number | null;
  passengers: number | null;
  route: string;
}

export async function getHelicopterTours(locale: Locale): Promise<HelicopterItem[]> {
  const [list, images] = await Promise.all([
    loadList<BackendHelicopter>("/helicopter-tours/", locale),
    loadList<BackendImage & { helicopter_id: number }>("/helicopter-images/"),
  ]);
  const byTour = groupImages(images, "helicopter_id");
  const flights = active(await withDetails("/helicopter-tours/", list, locale));
  return flights.map((h) => ({
    id: h.id,
    title: h.title,
    description: h.description ?? "",
    ...backendPictures(h.main_image, byTour.get(h.id)),
    price: backendPrice(h.price),
    unit: h.price_unit ?? "per_trip",
    minutes: h.duration_minutes ?? null,
    passengers: h.max_passengers ?? null,
    route: [h.departure_location, h.destination].filter(Boolean).join(" → "),
  }));
}

export async function getHelicopterTour(locale: Locale, id: number): Promise<HelicopterItem | null> {
  return (await getHelicopterTours(locale)).find((flight) => flight.id === id) ?? null;
}

interface BackendTrekking extends WithActive {
  id: number;
  title: string;
  description: string | null;
  price: string;
  price_unit: PriceUnit;
  duration_days: number | null;
  main_image: string | null;
}

interface BackendTrekkingProgram {
  id: number;
  trekking_id: number;
  day_number: number;
  start_time: string | null;
  end_time: string | null;
  title: string | null;
  description: string | null;
}

export interface TrekkingItem {
  id: number;
  title: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  unit: PriceUnit;
  days: number | null;
  program: { day: string; title: string; text: string }[];
}

export async function getTrekkings(locale: Locale): Promise<TrekkingItem[]> {
  const [list, images, programs] = await Promise.all([
    loadList<BackendTrekking>("/trekkings/", locale),
    loadList<BackendImage & { trekking_id: number }>("/trekking-images/"),
    loadList<BackendTrekkingProgram>("/trekking-programs/", locale),
  ]);
  const byTrek = groupImages(images, "trekking_id");
  const treks = active(await withDetails("/trekkings/", list, locale));
  return treks.map((t) => {
    const steps = programs
      .filter((p) => p.trekking_id === t.id)
      .sort((a, b) => a.day_number - b.day_number || (a.start_time ?? "").localeCompare(b.start_time ?? ""));
    return {
      id: t.id,
      title: t.title,
      description: t.description ?? "",
      ...backendPictures(t.main_image, byTrek.get(t.id)),
      price: backendPrice(t.price),
      unit: t.price_unit ?? "per_person",
      days: t.duration_days ?? (steps.at(-1)?.day_number || null),
      program: steps.map((p) => ({
        day: p.start_time ? `${p.day_number} · ${p.start_time.slice(0, 5)}` : String(p.day_number),
        title: p.title?.trim() ?? "",
        text: p.description?.trim() ?? "",
      })),
    };
  });
}

export async function getTrekking(id: number, locale: Locale): Promise<TrekkingItem | null> {
  return (await getTrekkings(locale)).find((t) => t.id === id) ?? null;
}

interface BackendFaq extends WithActive {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export async function getFaqs(locale: Locale): Promise<{ q: string; a: string }[]> {
  const list = await loadList<BackendFaq>("/faqs/", locale);
  return active(list)
    .sort((a, b) => a.order - b.order || a.id - b.id)
    .map((f) => ({ q: f.question, a: f.answer }));
}

interface BackendAboutSection extends WithActive {
  id: number;
  title: string | null;
  description: string | null;
  image: string | null;
  order: number;
}

export interface AboutSectionItem {
  id: number;
  title: string;
  text: string;
  image: string | null;
}

export async function getAboutSections(locale: Locale): Promise<AboutSectionItem[]> {
  const list = await loadList<BackendAboutSection>("/about-sections/", locale);
  return active(list)
    .sort((a, b) => a.order - b.order || a.id - b.id)
    .map((s) => ({ id: s.id, title: s.title ?? "", text: s.description ?? "", image: backendImage(s.image) }))
    .filter((s) => s.title || s.text);
}
