import { REQUEST_STATUSES, type RequestStatus, type TravelRequest } from "./resources";

export const digits = (phone: string) => phone.replace(/\D/g, "");
export const dateTime = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export const dateOnly = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (iso: string | null, format: Intl.DateTimeFormat) => {
  if (!iso) return "—";
  const date = new Date(iso.length === 10 ? `${iso}T00:00` : iso);
  return Number.isNaN(date.getTime()) ? iso : format.format(date);
};
export interface CatalogItem {
  title: string;
  image: string | null;
  kind: string;
}

export function findItem(catalog: CatalogItem[], destination: string | null): CatalogItem | null {
  const text = destination?.toLowerCase() ?? "";
  if (!text) return null;
  return catalog.filter((item) => item.title && text.includes(item.title.toLowerCase())).sort((a, b) => b.title.length - a.title.length)[0] ?? null;
}

export const statusLabel = (status: RequestStatus) => REQUEST_STATUSES.find((s) => s.value === status)?.label ?? status;

export type Period = "all" | "1" | "7" | "30" | "custom";
export type Sort = "newest" | "oldest" | "trip" | "name";

export const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "За всё время" },
  { value: "1", label: "Сегодня" },
  { value: "7", label: "7 дней" },
  { value: "30", label: "30 дней" },
  { value: "custom", label: "Свой период" },
];
export const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "trip", label: "По дате поездки" },
  { value: "name", label: "По имени" },
];
export const DAY_MS = 86_400_000;

export const startOfDay = (time: number) => new Date(new Date(time).toDateString()).getTime();

export function inPeriod(createdAt: string, period: Period, from: string, to: string): boolean {
  const time = Date.parse(createdAt);
  if (period === "all") return true;
  if (period === "custom") {
    if (from && time < new Date(`${from}T00:00`).getTime()) return false;
    if (to && time >= new Date(`${to}T00:00`).getTime() + DAY_MS) return false;
    return true;
  }
  return time >= startOfDay(Date.now()) - (Number(period) - 1) * DAY_MS;
}

export function compare(sort: Sort) {
  return (a: TravelRequest, b: TravelRequest) => {
    if (sort === "oldest") return Date.parse(a.created_at) - Date.parse(b.created_at);
    if (sort === "name") return a.name.localeCompare(b.name, "ru");
    if (sort === "trip") {
      if (!a.travel_date || !b.travel_date) return a.travel_date ? -1 : b.travel_date ? 1 : 0;
      return a.travel_date.localeCompare(b.travel_date);
    }
    return Date.parse(b.created_at) - Date.parse(a.created_at);
  };
}
