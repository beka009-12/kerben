import { PRICE_UNITS, type AdminRecord } from "./resources";

export function priceText(record: AdminRecord) {
  const n = Number(record.price);
  if (!Number.isFinite(n)) return "—";
  const unit = PRICE_UNITS.find((u) => u.value === record.price_unit)?.label;
  return `${new Intl.NumberFormat("ru-RU").format(n)} $${unit ? ` ${unit}` : ""}`;
}

const hiddenKey = (resource: string) => `kg-admin-hidden-${resource}`;

export function readHidden(resource: string): AdminRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(hiddenKey(resource)) ?? "[]");
    return Array.isArray(parsed) ? (parsed as AdminRecord[]) : [];
  } catch {
    return [];
  }
}

export function writeHidden(resource: string, records: AdminRecord[]) {
  try {
    if (records.length) localStorage.setItem(hiddenKey(resource), JSON.stringify(records));
    else localStorage.removeItem(hiddenKey(resource));
  } catch {
    return;
  }
}

export const adminDateTime = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
