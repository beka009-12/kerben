"use server";

import { cookies, headers } from "next/headers";
import { updateTag } from "next/cache";
import { AdminAuthError, adminAuthenticate, adminFetch, adminLogout, adminRefresh } from "@/utils/admin/api";
import { fieldErrorsFrom422, toPayload, validateValues, type FormValues } from "@/utils/admin/form";
import { REQUEST_STATUSES, RESOURCES, type AdminRecord, type RequestStatus, type ResourceDef, type ResourceKey } from "@/utils/admin/resources";
import { ADMIN_COOKIE, ADMIN_DEVICE_COOKIE, ADMIN_REFRESH_COOKIE, writeAdminSession } from "@/utils/admin/tokens";
import { ApiError } from "@/utils/api/client";
import { BACKEND_URL, backendImage } from "@/utils/api/backend";

export type ActionResult =
  | { ok: true; record?: AdminRecord }
  | { ok: false; error: "auth" | "network" | "validation" | "backend"; message?: string; fields?: Record<string, string> };

const MAX_FAILURES = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, number[]>();

function recentFailures(ip: string, now: number): number[] {
  const list = (failures.get(ip) ?? []).filter((t) => now - t < FAILURE_WINDOW_MS);
  failures.set(ip, list);
  return list;
}

export type SignInResult = { ok: true } | { ok: false; error: "invalid" | "rate" | "network" };

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function adminSignIn(email: string, password: string, totpCode = "", rememberDevice = false): Promise<SignInResult> {
  const username = typeof email === "string" ? email.trim() : "";
  if (!username || typeof password !== "string" || !password) return { ok: false, error: "invalid" };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  if (recentFailures(ip, now).length >= MAX_FAILURES) return { ok: false, error: "rate" };
  const store = await cookies();
  const result = await adminAuthenticate(username, password, {
    totpCode: typeof totpCode === "string" ? totpCode : "",
    rememberDevice: rememberDevice === true,
    deviceToken: store.get(ADMIN_DEVICE_COOKIE)?.value ?? "",
  });
  if (!result.ok) {
    if (result.reason === "invalid") failures.set(ip, [...recentFailures(ip, now), now]);
    return { ok: false, error: result.reason };
  }
  failures.delete(ip);
  writeAdminSession(store, result.tokens);
  return { ok: true };
}

export async function adminSignOut(): Promise<void> {
  const store = await cookies();
  const refreshToken = store.get(ADMIN_REFRESH_COOKIE)?.value;
  if (refreshToken) await adminLogout(refreshToken);
  store.delete(ADMIN_COOKIE);
  store.delete(ADMIN_REFRESH_COOKIE);
}

async function renewSession(store: CookieStore): Promise<string | null> {
  const refreshToken = store.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  const tokens = await adminRefresh(refreshToken);
  if (!tokens) return null;
  writeAdminSession(store, tokens);
  return tokens.accessToken;
}

async function failure(error: unknown, store: CookieStore): Promise<ActionResult> {
  if (error instanceof AdminAuthError) {
    store.delete(ADMIN_COOKIE);
    store.delete(ADMIN_REFRESH_COOKIE);
    return { ok: false, error: "auth" };
  }
  if (error instanceof ApiError && error.status === 422) {
    const details = (error.details as { detail?: unknown } | null)?.detail;
    return { ok: false, error: "validation", fields: fieldErrorsFrom422(details), message: error.message };
  }
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return { ok: false, error: "backend", message: error.message };
  }
  console.error("[admin] backend error:", error instanceof ApiError ? `${error.status} ${error.message}` : error);
  return { ok: false, error: "network" };
}

async function withAdmin(run: (token: string) => Promise<ActionResult>): Promise<ActionResult> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value || (await renewSession(store));
  if (!token) return { ok: false, error: "auth" };
  try {
    return await run(token);
  } catch (error) {
    if (!(error instanceof AdminAuthError)) return failure(error, store);
    const fresh = await renewSession(store);
    if (!fresh) return failure(error, store);
    try {
      return await run(fresh);
    } catch (retry) {
      return failure(retry, store);
    }
  }
}

function isFormValues(value: unknown): value is FormValues {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(
    (v) => typeof v === "string" || typeof v === "boolean" || (Array.isArray(v) && v.every((item) => typeof item === "string")),
  );
}

function resource(key: ResourceKey): ResourceDef | null {
  return Object.hasOwn(RESOURCES, key) ? RESOURCES[key] : null;
}

async function refresh(def: ResourceDef) {
  def.tags.forEach((tag) => updateTag(tag));
}

export async function saveRecord(
  key: ResourceKey,
  id: number | null,
  values: FormValues,
  original: FormValues | null,
): Promise<ActionResult> {
  const def = resource(key);
  if (!def) return { ok: false, error: "backend", message: "Unknown section" };
  if ((id !== null && !Number.isInteger(id)) || !isFormValues(values) || (original !== null && !isFormValues(original))) {
    return { ok: false, error: "validation" };
  }
  return withAdmin(async (token) => {
    const fields = validateValues(def, values);
    if (Object.keys(fields).length > 0) return { ok: false, error: "validation", fields };
    const payload = toPayload(def, values, id === null ? null : original);
    if (id !== null && Object.keys(payload).length === 0) return { ok: true };
    const record = await adminFetch<AdminRecord>(token, id === null ? def.path : `${def.path}${id}/`, {
      method: id === null ? "POST" : "PUT",
      body: payload,
    });
    await refresh(def);
    return { ok: true, record };
  });
}

export async function deleteRecord(key: ResourceKey, id: number): Promise<ActionResult> {
  const def = resource(key);
  if (!def || !Number.isInteger(id)) return { ok: false, error: "backend", message: "Unknown record" };
  return withAdmin(async (token) => {
    await adminFetch(token, `${def.path}${id}/`, { method: "DELETE" });
    await refresh(def);
    return { ok: true };
  });
}

export type UploadResult = { ok: true; url: string } | { ok: false; error: "auth" | "type" | "size" | "network" };

const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

export async function uploadPhoto(form: FormData): Promise<UploadResult> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value || (await renewSession(store));
  if (!token) return { ok: false, error: "auth" };
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, error: "type" };
  if (!UPLOAD_TYPES.includes(file.type)) return { ok: false, error: "type" };
  if (file.size > UPLOAD_MAX_BYTES) return { ok: false, error: "size" };

  const body = new FormData();
  body.set("file", file);
  try {
    const res = await fetch(`${BACKEND_URL}/admin/media/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (res.status === 401 || res.status === 403) return { ok: false, error: "auth" };
    if (res.status === 413) return { ok: false, error: "size" };
    if (res.status === 415 || res.status === 422) return { ok: false, error: "type" };
    const raw = [data?.url, data?.file_url, data?.file, data?.path, data?.image].find((v): v is string => typeof v === "string" && v !== "");
    const url = backendImage(raw);
    if (!res.ok || !url) return { ok: false, error: "network" };
    return { ok: true, url };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function setRequestStatus(id: number, status: RequestStatus): Promise<ActionResult> {
  if (!Number.isInteger(id) || !REQUEST_STATUSES.some((s) => s.value === status)) return { ok: false, error: "validation" };
  return withAdmin(async (token) => {
    await adminFetch(token, `/admin/requests/${id}/status/`, { method: "PATCH", body: { status } });
    return { ok: true };
  });
}

export async function retranslateTour(id: number): Promise<ActionResult> {
  if (!Number.isInteger(id)) return { ok: false, error: "validation" };
  return withAdmin(async (token) => {
    await adminFetch(token, `/tours/${id}/translate/`, { method: "POST" });
    await refresh(RESOURCES.tours);
    return { ok: true };
  });
}
