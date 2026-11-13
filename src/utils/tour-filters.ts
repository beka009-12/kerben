import type { Tour, TourCategory } from "@/types/tour";

export type SortKey = "popular" | "priceAsc" | "priceDesc" | "rating" | "duration";
export type DurationKey = "one" | "short" | "long";
export type FormatKey = "individual" | "group";

export const THEMES = ["mountain", "lake", "nomad", "adventure", "history", "winter"] as const;
export type Theme = (typeof THEMES)[number];

const THEME_WORDS: Record<Theme, RegExp> = {
  mountain: /гор[аынуе]|горн|пик|перевал|ледник|ущель|тянь-шан|ала-арч|mountain|peak|glacier|gorge|\bpass\b|\bberg|gletscher|schlucht|山|峰|冰川/i,
  lake: /озер|озёр|иссык|сон-кул|кел-суу|кёл|lake|\bsee\b|湖/i,
  nomad: /юрт|кочев|кумыс|беркут|пастух|nomad|yurt|jurte|eagle|游牧|毡房/i,
  adventure: /конн|лошад|трек|рафтинг|поход|приключ|horse|trek|raft|hike|adventure|abenteuer|wander|徒步|骑马|探险/i,
  history: /истор|бурана|шёлков|шелков|крепост|музей|караван|histor|silk|burana|museum|caravan|geschichte|seiden|历史|丝绸|古/i,
  winter: /зим|лыж|снег|winter|\bski|snow|schnee|滑雪|冬|雪/i,
};
const THEME_TYPES: Partial<Record<Theme, string[]>> = { winter: ["winter"], adventure: ["adventure"], history: ["cultural"] };

export function matchesTheme(tour: Tour, theme: Theme): boolean {
  if (tour.tourType && THEME_TYPES[theme]?.includes(tour.tourType)) return true;
  const text = [tour.title, tour.summary, tour.categoryName, ...tour.itinerary.flatMap((s) => [s.title, s.text])].join(" ");
  return THEME_WORDS[theme].test(text);
}

export interface TourFilters {
  query: string;
  theme: Theme | "all";
  category: TourCategory | "all";
  /** Направление из поиска: локация тура (категория из админки) или «все» */
  place: string;
  /** Даты поездки: тур должен поместиться в выбранные дни */
  from: string;
  to: string;
  minPrice: number;
  maxPrice: number;
  guests: number;
  durations: DurationKey[];
  formats: FormatKey[];
  sort: SortKey;
}

export const defaultFilters: TourFilters = {
  query: "",
  theme: "all",
  category: "all",
  place: "",
  from: "",
  to: "",
  minPrice: 0,
  maxPrice: 0,
  guests: 0,
  durations: [],
  formats: [],
  sort: "popular",
};

/** 1 день · 2–3 дня · 4+ дня */
export function durationOf(days: number): DurationKey {
  return days <= 1 ? "one" : days <= 3 ? "short" : "long";
}

/** Индивидуальный — тип тура из админки; остальные туры групповые */
export const formatOf = (tour: Pick<Tour, "tourType">): FormatKey => (tour.tourType === "individual" ? "individual" : "group");

/** Сколько дней между датами включительно; 0 — даты не выбраны или перепутаны */
export function tripDays(from: string, to: string): number {
  if (!from || !to) return 0;
  const days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1;
  return Number.isFinite(days) && days > 0 ? days : 0;
}

/** Локация в карточке: направление из админки, иначе страна */
export const tourLocation = (tour: Pick<Tour, "categoryName" | "country">) => tour.categoryName?.trim() || tour.country;

export function maxGroup(groupSize: string): number {
  const numbers = groupSize.match(/\d+/g);
  return numbers ? Number(numbers[numbers.length - 1]) : Infinity;
}

export function filterTours(tours: Tour[], f: TourFilters): Tour[] {
  const q = f.query.trim().toLocaleLowerCase();
  const result = tours.filter((tour) => {
    if (f.theme !== "all" && !matchesTheme(tour, f.theme)) return false;
    if (f.category !== "all" && tour.category !== f.category) return false;
    if (f.place && tourLocation(tour) !== f.place) return false;
    if (f.minPrice > 0 && tour.price < f.minPrice) return false;
    if (f.maxPrice > 0 && tour.price > f.maxPrice) return false;
    if (f.guests > 0 && maxGroup(tour.groupSize) < f.guests) return false;
    if (f.durations.length > 0 && !f.durations.includes(durationOf(tour.days))) return false;
    if (f.formats.length > 0 && !f.formats.includes(formatOf(tour))) return false;
    const span = tripDays(f.from, f.to);
    if (span > 0 && tour.days > span) return false;
    if (q) {
      const text = [tour.title, tour.country, tour.summary, ...tour.itinerary.map((s) => s.title)]
        .join(" ")
        .toLocaleLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return [...result].sort((a, b) => {
    switch (f.sort) {
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "duration":
        return a.days - b.days;
      default:
        return b.reviews - a.reviews;
    }
  });
}

export const CATEGORIES: TourCategory[] = ["nature", "beach", "culture", "adventure", "luxury", "family"];
export const SORTS: SortKey[] = ["popular", "priceAsc", "priceDesc", "duration"];
/** Темы в строке над каталогом (как в макете): зимние туры остаются доступны по ссылке ?theme=winter */
export const ROW_THEMES: Theme[] = ["mountain", "lake", "nomad", "adventure", "history"];
export const DURATIONS: DurationKey[] = ["one", "short", "long"];
export const FORMATS: FormatKey[] = ["individual", "group"];
export const PRICES = [0, 400, 500, 700, 1000];
export const GUESTS = [0, 1, 2, 4, 6, 8, 10, 12, 14];

const isoDate = (value: string | null) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "");
const listOf = <T extends string>(value: string | null, allowed: readonly T[]) =>
  (value ?? "").split(",").filter((item): item is T => allowed.includes(item as T));

export function readFilters(params: URLSearchParams): TourFilters {
  const category = params.get("category") as TourCategory | null;
  const sort = params.get("sort") as SortKey | null;
  const theme = params.get("theme") as Theme | null;
  return {
    query: params.get("q") ?? "",
    theme: theme && THEMES.includes(theme) ? theme : "all",
    category: category && CATEGORIES.includes(category) ? category : "all",
    place: params.get("place") ?? "",
    from: isoDate(params.get("from")),
    to: isoDate(params.get("to")),
    minPrice: Number(params.get("min")) || 0,
    maxPrice: Number(params.get("price")) || 0,
    guests: Number(params.get("guests")) || 0,
    durations: listOf(params.get("days"), DURATIONS),
    formats: listOf(params.get("format"), FORMATS),
    sort: sort && SORTS.includes(sort) ? sort : "popular",
  };
}

/** Фильтры → адрес страницы (без значений по умолчанию), чтобы ссылкой можно было поделиться */
export function filtersToParams(f: TourFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.query) params.set("q", f.query);
  if (f.theme !== "all") params.set("theme", f.theme);
  if (f.category !== "all") params.set("category", f.category);
  if (f.place) params.set("place", f.place);
  if (f.from) params.set("from", f.from);
  if (f.to) params.set("to", f.to);
  if (f.minPrice) params.set("min", String(f.minPrice));
  if (f.maxPrice) params.set("price", String(f.maxPrice));
  if (f.guests) params.set("guests", String(f.guests));
  if (f.durations.length) params.set("days", f.durations.join(","));
  if (f.formats.length) params.set("format", f.formats.join(","));
  if (f.sort !== "popular") params.set("sort", f.sort);
  return params;
}
