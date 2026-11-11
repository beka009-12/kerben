import { apiFetch } from "@/utils/api/client";

export const ADMIN_COOKIE = "kg_admin";
export const ADMIN_REFRESH_COOKIE = "kg_admin_refresh";
export const ADMIN_DEVICE_COOKIE = "kg_admin_device";

export const DEVICE_SECONDS = 30 * 24 * 60 * 60;
const ACCESS_SECONDS = 60 * 60;
const MAX_ACCESS_SECONDS = 12 * 60 * 60;
const REFRESH_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_TIMEOUT_MS = 5_000;

export interface AdminTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken: string | null;
  refreshExpiresAt: number | null;
  deviceToken: string | null;
}

interface CookieWriter {
  set(name: string, value: string, options: { httpOnly: boolean; secure: boolean; sameSite: "lax"; path: string; maxAge: number }): unknown;
}

const text = (value: unknown) => (typeof value === "string" && value ? value : null);

export function parseAdminTokens(data: unknown, now = Date.now()): AdminTokens | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const accessToken = text(record.access_token);
  if (!accessToken) return null;
  const expiresIn =
    typeof record.expires_in === "number" && Number.isFinite(record.expires_in) && record.expires_in > 0
      ? Math.min(Math.floor(record.expires_in), MAX_ACCESS_SECONDS)
      : ACCESS_SECONDS;
  const refreshAt = Date.parse(text(record.refresh_expires_at) ?? "");
  return {
    accessToken,
    expiresIn,
    refreshToken: text(record.refresh_token),
    refreshExpiresAt: Number.isFinite(refreshAt) && refreshAt > now ? refreshAt : null,
    deviceToken: text(record.device_token),
  };
}

export function writeAdminSession(store: CookieWriter, tokens: AdminTokens, now = Date.now()) {
  const base = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  store.set(ADMIN_COOKIE, tokens.accessToken, { ...base, maxAge: tokens.expiresIn });
  if (tokens.refreshToken) {
    const maxAge = tokens.refreshExpiresAt ? Math.floor((tokens.refreshExpiresAt - now) / 1000) : REFRESH_SECONDS;
    store.set(ADMIN_REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge });
  }
  if (tokens.deviceToken) store.set(ADMIN_DEVICE_COOKIE, tokens.deviceToken, { ...base, maxAge: DEVICE_SECONDS });
}

export async function refreshAdminTokens(backend: string, refreshToken: string): Promise<AdminTokens | null> {
  try {
    const data = await apiFetch<unknown>(`${backend}/admin/token/refresh/`, {
      method: "POST",
      body: { refresh_token: refreshToken },
      timeoutMs: REFRESH_TIMEOUT_MS,
    });
    return parseAdminTokens(data);
  } catch {
    return null;
  }
}
