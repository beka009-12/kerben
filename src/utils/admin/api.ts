import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { BACKEND_URL } from "@/utils/api/backend";
import { ApiError, apiFetch } from "@/utils/api/client";
import type { AdminRecord, ResourceDef } from "./resources";
import { parseAdminTokens, refreshAdminTokens, type AdminTokens } from "./tokens";

export interface AdminProfile {
  id: number;
  username: string;
}

export class AdminAuthError extends Error {
  constructor() {
    super("Admin session expired");
    this.name = "AdminAuthError";
  }
}

const TIMEOUT_MS = 10_000;
const LOGIN_TIMEOUT_MS = 3_000;

export type AdminLoginResult = { ok: true; tokens: AdminTokens } | { ok: false; reason: "invalid" | "rate" | "network" };

export interface AdminLoginOptions {
  totpCode?: string;
  rememberDevice?: boolean;
  deviceToken?: string;
}

export async function adminAuthenticate(username: string, password: string, { totpCode = "", rememberDevice = false, deviceToken = "" }: AdminLoginOptions = {}): Promise<AdminLoginResult> {
  const code = totpCode.replace(/\s+/g, "").slice(0, 32);
  try {
    const res = await apiFetch<unknown>(`${BACKEND_URL}/admin/login/`, {
      method: "POST",
      body: {
        username,
        password,
        ...(code ? { totp_code: code } : {}),
        ...(rememberDevice ? { remember_device: true } : {}),
        ...(deviceToken ? { device_token: deviceToken } : {}),
      },
      timeoutMs: LOGIN_TIMEOUT_MS,
    });
    const tokens = parseAdminTokens(res);
    return tokens ? { ok: true, tokens } : { ok: false, reason: "network" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) return { ok: false, reason: "rate" };
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) return { ok: false, reason: "invalid" };
    return { ok: false, reason: "network" };
  }
}

export async function adminLogin(username: string, password: string, totpCode = ""): Promise<string | null> {
  const result = await adminAuthenticate(username, password, { totpCode });
  return result.ok ? result.tokens.accessToken : null;
}

export const adminRefresh = (refreshToken: string) => refreshAdminTokens(BACKEND_URL, refreshToken);

export async function adminLogout(refreshToken: string): Promise<void> {
  try {
    await apiFetch(`${BACKEND_URL}/admin/logout/`, { method: "POST", body: { refresh_token: refreshToken }, timeoutMs: LOGIN_TIMEOUT_MS });
  } catch {}
}

export async function adminFetch<T>(token: string, path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  try {
    return await apiFetch<T>(`${BACKEND_URL}${path}`, {
      ...init,
      timeoutMs: TIMEOUT_MS,
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) throw new AdminAuthError();
    throw error;
  }
}

/** null — токен больше не действует (401/403). Сбой сети или таймаут — не повод выкидывать из админки */
export async function adminMe(token: string): Promise<AdminProfile | null | "unavailable"> {
  try {
    const me = await adminFetch<{ id: number; username: string }>(token, "/admin/me/");
    return { id: me.id, username: me.username };
  } catch (error) {
    return error instanceof AdminAuthError ? null : "unavailable";
  }
}

async function listCached(token: string, path: string, tags: string[]): Promise<{ data: unknown } | { expired: true }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("admin", ...tags);
  try {
    return { data: await adminFetch<unknown>(token, path) };
  } catch (error) {
    if (error instanceof AdminAuthError) return { expired: true };
    throw error;
  }
}

export async function listRecords(token: string, def: ResourceDef): Promise<AdminRecord[]> {
  const result = await listCached(token, def.usesLang ? `${def.path}?lang=ru` : def.path, def.tags);
  if ("expired" in result) throw new AdminAuthError();
  return Array.isArray(result.data) ? (result.data as AdminRecord[]) : [];
}
