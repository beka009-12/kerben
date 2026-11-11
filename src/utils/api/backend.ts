import "server-only";
import { ApiError, apiFetch } from "./client";
import { dedupe } from "./dedupe";

export const BACKEND_URL = (process.env.KERBEN_API_URL || process.env.KYRGYZGO_API_URL || "https://13.49.104.87").replace(/\/+$/, "");

// Старые имена KYRGYZGO_* тоже работают, чтобы не ломать уже настроенные окружения
const SITE_EMAIL = (process.env.KERBEN_SITE_EMAIL || process.env.KYRGYZGO_SITE_EMAIL)?.trim();
const SITE_PASSWORD = process.env.KERBEN_SITE_PASSWORD || process.env.KYRGYZGO_SITE_PASSWORD;
const TOKEN_TTL_MS = 20 * 60_000;
let siteToken: { value: string; until: number } | null = null;
let siteLogin: Promise<string | null> | null = null;

export const hasSiteAccount = () => !!SITE_EMAIL && !!SITE_PASSWORD;

async function loginSite(): Promise<string | null> {
  try {
    const data = await apiFetch<Record<string, unknown>>(`${BACKEND_URL}/account/login`, {
      method: "POST",
      body: { email: SITE_EMAIL, password: SITE_PASSWORD },
      timeoutMs: 8000,
    });
    const token = [data?.access_token, data?.token, data?.access].find((v): v is string => typeof v === "string" && v !== "");
    if (!token) console.warn("[backend] site login: no token in response");
    siteToken = token ? { value: token, until: Date.now() + TOKEN_TTL_MS } : null;
    return token ?? null;
  } catch (error) {
    console.warn("[backend] site login failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function getSiteToken(): Promise<string | null> {
  if (!hasSiteAccount()) return null;
  if (siteToken && siteToken.until > Date.now()) return siteToken.value;
  siteLogin ??= loginSite().finally(() => (siteLogin = null));
  return siteLogin;
}

export async function backendFetch<T>(path: string, init?: Parameters<typeof apiFetch>[1]): Promise<T> {
  const read = !init?.method || init.method === "GET";
  const own = new Headers(init?.headers as HeadersInit | undefined).has("Authorization");
  if (read && !own && init?.body === undefined) return dedupe(`backend:${path}`, () => backendRequest<T>(path, init, read, own));
  return backendRequest<T>(path, init, read, own);
}

async function backendRequest<T>(path: string, init: Parameters<typeof apiFetch>[1], read: boolean, own: boolean): Promise<T> {
  const options = { timeoutMs: 8000, ...init };
  const token = read && !own ? await getSiteToken() : null;
  if (!token) return apiFetch<T>(`${BACKEND_URL}${path}`, options);

  const send = (value: string) =>
    apiFetch<T>(`${BACKEND_URL}${path}`, { ...options, headers: { ...(options.headers as Record<string, string>), Authorization: `Bearer ${value}` } });
  try {
    return await send(token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    siteToken = null;
    const fresh = await getSiteToken();
    if (!fresh) throw error;
    return send(fresh);
  }
}

const IMAGE_HOSTS = new Set([hostOf(BACKEND_URL), "images.unsplash.com", "upload.wikimedia.org"]);

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function backendImage(src: string | null | undefined): string | null {
  const value = src?.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return IMAGE_HOSTS.has(hostOf(value)) ? value : null;
  return `${BACKEND_URL}/${value.replace(/^\/+/, "")}`;
}

export function backendPrice(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : Number.parseFloat(value ?? "");
  return Number.isFinite(n) ? n : 0;
}

export type PriceUnit = "per_person" | "per_day" | "per_night" | "per_hour" | "per_trip";
export type TourType = "classic" | "adventure" | "cultural" | "winter" | "individual" | "combined";

export interface BackendTour {
  id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  included: string | null;
  excluded: string | null;
  price: string;
  price_unit: PriceUnit;
  duration_days: number | null;
  duration_nights: number | null;
  min_people: number;
  max_people: number | null;
  tour_type: TourType;
  latitude?: string | null;
  longitude?: string | null;
  main_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  /** Есть только в списке туров (новый API) */
  average_rating?: number | null;
  review_count?: number;
}

export interface BackendTourImage {
  id: number;
  tour_id: number;
  image: string;
  order: number;
}

export interface BackendTourProgram {
  id: number;
  tour_id: number;
  day_number: number;
  title: string | null;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface BackendTourDetail extends BackendTour {
  images?: BackendTourImage[];
  programs?: BackendTourProgram[];
}

export interface BackendTravelRequestInput {
  name: string;
  phone: string;
  email?: string | null;
  travel_date?: string | null;
  duration_days?: number | null;
  travelers_count?: number | null;
  destination?: string | null;
  message?: string | null;
}

