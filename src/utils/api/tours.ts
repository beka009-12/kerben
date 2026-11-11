import { cacheLife, cacheTag } from "next/cache";
import { NO_PHOTO } from "@/data/images";
import type { Locale } from "@/utils/i18n/config";
import type { LngLat, Tour, TourCategory } from "@/types/tour";
import {
  backendFetch,
  backendImage,
  backendPrice,
  hasSiteAccount,
  type BackendTour,
  type BackendTourDetail,
  type TourType,
} from "./backend";
import { getTourCategoryNames } from "./catalog";

export function isBackendTour(value: unknown): value is BackendTour {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<BackendTour>;
  return typeof t.id === "number" && typeof t.title === "string" && t.title.trim() !== "";
}

const CATEGORY: Record<TourType, TourCategory> = {
  classic: "nature",
  adventure: "adventure",
  cultural: "culture",
  winter: "adventure",
  individual: "luxury",
  combined: "culture",
};

const KYRGYZSTAN: LngLat = [74.77, 41.45];

export function hasLocation(tour: Pick<Tour, "coords">): boolean {
  return tour.coords[0] !== KYRGYZSTAN[0] || tour.coords[1] !== KYRGYZSTAN[1];
}
const COUNTRY: Record<Locale, string> = { ru: "Кыргызстан", en: "Kyrgyzstan", de: "Kirgisistan", zh: "吉尔吉斯斯坦" };

export function splitList(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n|;|•|,\s+/)
    .map((item) => item.replace(/^[\s\-–—*·]+/, "").trim())
    .filter(Boolean);
}

function shorten(text: string, max = 160): string {
  const first = text.split(/(?<=[.!?])\s/)[0] ?? text;
  const base = first.length <= max ? first : text;
  return base.length <= max ? base : `${base.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function toPoint(lng: string | null | undefined, lat: string | null | undefined): LngLat | null {
  const x = Number.parseFloat(lng ?? "");
  const y = Number.parseFloat(lat ?? "");
  return Number.isFinite(x) && Number.isFinite(y) && (x !== 0 || y !== 0) ? [x, y] : null;
}

/** «ТЕСТ: Ала-Арча» → «Ала-Арча»: служебная пометка демо-записей backend людям не нужна */
export const cleanTitle = (text: string) => text.replace(/^\s*(ТЕСТ|TEST)\s*:\s*/i, "").trim();

export function fromBackendTour(raw: BackendTourDetail, locale: Locale, categories?: Map<number, string>): Tour {
  const description = (raw.description ?? "").trim();
  const real = [
    backendImage(raw.main_image),
    ...[...(raw.images ?? [])].sort((a, b) => a.order - b.order).map((img) => backendImage(img.image)),
  ].filter((src): src is string => !!src);
  const photoSet = [...new Set(real)];
  const image = photoSet[0] ?? NO_PHOTO;
  const gallery = photoSet.slice(1);
  const programs = [...(raw.programs ?? [])].sort((a, b) => a.day_number - b.day_number || (a.start_time ?? "").localeCompare(b.start_time ?? ""));
  const min = raw.min_people || 1;

  return {
    id: raw.id,
    slug: String(raw.id),
    place: cleanTitle(raw.title),
    title: cleanTitle(raw.title),
    country: COUNTRY[locale],
    summary: shorten(description),
    overview: description,
    region: "asia",
    coords: KYRGYZSTAN,
    point: toPoint(raw.longitude, raw.latitude),
    image,
    gallery,
    price: backendPrice(raw.price),
    rating: Number(raw.average_rating) || 0,
    reviews: raw.review_count ?? 0,
    days: raw.duration_days ?? Math.max(1, programs.at(-1)?.day_number ?? 1),
    nights: raw.duration_nights ?? null,
    groupSize: raw.max_people ? `${min}–${raw.max_people}` : `${min}+`,
    difficulty: null,
    languages: [],
    category: CATEGORY[raw.tour_type] ?? "nature",
    tourType: raw.tour_type,
    ...(raw.category_id != null && categories?.get(raw.category_id) ? { categoryName: cleanTitle(categories.get(raw.category_id) ?? "") } : {}),
    badge: null,
    highlights: [],
    itinerary: programs.map((p) => ({
      day: p.start_time ? `${p.day_number} · ${p.start_time.slice(0, 5)}` : String(p.day_number),
      title: p.title?.trim() || "",
      text: p.description?.trim() || "",
      coords: KYRGYZSTAN,
    })),
    included: splitList(raw.included),
    excluded: splitList(raw.excluded),
  };
}

export async function loadBackendTours(locale: Locale): Promise<Tour[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("tours");

  const [list, slides, categories] = await Promise.all([
    backendFetch<unknown>(`/tours/?lang=${locale}`),
    loadTourSlides(locale),
    getTourCategoryNames(locale),
  ]);
  const tours = (Array.isArray(list) ? list : []).filter(isBackendTour).filter((t) => t.is_active !== false);
  if (tours.length === 0) return [];
  const details = await Promise.all(
    tours.map((tour) => {
      const fallback = { ...tour, description: tour.description ?? slides.get(tour.id) ?? null } as BackendTourDetail;
      if (!hasSiteAccount()) return fallback;
      return backendFetch<BackendTourDetail>(`/tours/${tour.id}/?lang=${locale}`)
        .then((detail) => ({ ...fallback, ...detail }))
        .catch((error: unknown) => {
          console.warn(`[tours] detail ${tour.id} failed:`, error instanceof Error ? error.message : error);
          return fallback;
        });
    }),
  );
  return details.map((tour) => fromBackendTour(tour, locale, categories));
}

async function loadTourSlides(locale: Locale): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  try {
    const data = await backendFetch<{ slides?: { id?: unknown; description?: unknown }[] }>(`/tours/home/slides/?lang=${locale}`);
    for (const slide of data?.slides ?? []) {
      if (typeof slide.id === "number" && typeof slide.description === "string" && slide.description.trim()) map.set(slide.id, slide.description);
    }
  } catch (error) {
    console.warn("[tours] slides unavailable:", error instanceof Error ? error.message : error);
  }
  return map;
}

/** Туры только из backend: если их нет или backend недоступен — пустой список, без выдуманных туров */
export async function getTours(locale: Locale): Promise<Tour[]> {
  try {
    return await loadBackendTours(locale);
  } catch (error) {
    console.warn("[tours] backend unavailable:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getTour(slug: string, locale: Locale): Promise<Tour | null> {
  const tours = await getTours(locale);
  return tours.find((tour) => tour.slug === slug) ?? null;
}

export async function getTourSlugs(): Promise<string[]> {
  const tours = await getTours("en");
  return tours.map((tour) => tour.slug);
}
