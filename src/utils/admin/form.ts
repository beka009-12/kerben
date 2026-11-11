import type { AdminRecord, FieldDef, ResourceDef } from "./resources";

export type FormValue = string | boolean | string[];
export type FormValues = Record<string, FormValue>;

const REQUIRED = "Обязательное поле";
const NOT_A_NUMBER = "Введите число";
const NOT_AN_INTEGER = "Введите целое число";
const NOT_A_LINK = "Нужна ссылка, например https://wa.me/996700123456";

export function parseNumber(value: string): number | null {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
  return Number(normalized);
}

function emptyValue(field: FieldDef): FormValue {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "boolean") return false;
  if (field.type === "list") return [];
  return "";
}

function toFormValue(field: FieldDef, raw: unknown): FormValue {
  if (raw === undefined) return emptyValue(field);
  if (field.type === "boolean") return raw === true;
  if (field.type === "list") return Array.isArray(raw) ? raw.map(String) : [];
  if (raw === null) return "";
  if (field.type === "price" || field.type === "number") {
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? String(n) : String(raw);
  }
  if (field.type === "time") return String(raw).slice(0, 5);
  return String(raw);
}

export function toFormValues(def: ResourceDef, record: AdminRecord | null): FormValues {
  const values: FormValues = {};
  for (const field of def.fields) values[field.name] = record ? toFormValue(field, record[field.name]) : emptyValue(field);
  return values;
}

const text = (value: FormValue | undefined) => (typeof value === "string" ? value.trim() : "");

export function validateValues(def: ResourceDef, values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of def.fields) {
    const value = values[field.name];
    if (field.type === "boolean") continue;
    if (field.type === "list") {
      if (field.required && (!Array.isArray(value) || value.every((item) => !item.trim()))) errors[field.name] = REQUIRED;
      continue;
    }
    if (!text(value)) {
      if (field.required) errors[field.name] = REQUIRED;
      continue;
    }
    if (field.type === "number" || field.type === "price" || field.type === "relation") {
      const n = parseNumber(text(value));
      if (n === null || Number.isNaN(n)) errors[field.name] = NOT_A_NUMBER;
      else if (field.type !== "price" && !Number.isInteger(n)) errors[field.name] = NOT_AN_INTEGER;
    }
    if (field.type === "url" && !/^https?:\/\/\S+$/i.test(text(value))) errors[field.name] = NOT_A_LINK;
  }
  return errors;
}

function toApiValue(field: FieldDef, value: FormValue | undefined): unknown {
  if (field.type === "boolean") return value === true;
  if (field.type === "list") return (Array.isArray(value) ? value : []).map((item) => item.trim()).filter(Boolean);
  const v = text(value);
  if (!v) return null;
  if (field.type === "number" || field.type === "price" || field.type === "relation") return parseNumber(v);
  return v;
}

export function toPayload(def: ResourceDef, values: FormValues, original: FormValues | null): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of def.fields) {
    const next = toApiValue(field, values[field.name]);
    if (original && JSON.stringify(next) === JSON.stringify(toApiValue(field, original[field.name]))) continue;
    payload[field.name] = next;
  }
  return payload;
}

export function fieldErrorsFrom422(detail: unknown): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!Array.isArray(detail)) return errors;
  for (const item of detail) {
    const loc = (item as { loc?: unknown })?.loc;
    const msg = (item as { msg?: unknown })?.msg;
    if (Array.isArray(loc) && loc[0] === "body" && typeof loc[1] === "string" && typeof msg === "string") errors[loc[1]] = msg;
  }
  return errors;
}
