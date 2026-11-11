import { ChatHttpError, chatApi } from "@/utils/ai/backend-chat";
import { cancelBackendRequest } from "@/utils/api/client-backend";
import { dedupe } from "@/utils/api/dedupe";
import { readSession } from "@/utils/store/auth";

export type RequestKind = "tour" | "hotel" | "transport" | "helicopter" | "trekking" | "request";
export type RequestStatus = "new" | "in_progress" | "completed" | "cancelled";

export interface TicketDetails {
  items: { icon: string; label: string; title: string; image: string | null; price: string }[];
  date: string;
  endDate: string;
  guests: number | null;
  message: string;
}

export interface MyRequest {
  id: string;
  kind: RequestKind;
  title: string;
  link: string | null;
  image: string | null;
  price: number | null;
  unit: string | null;
  backendId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  status: RequestStatus;
  createdAt: string;
  details?: TicketDetails | null;
}

export type NewRequest = Omit<MyRequest, "id" | "status" | "createdAt">;

/** Заявки живут в backend (/travel-requests/me/); в браузере — только подробности билета (фото, состав поездки) */
const STORAGE_KEY = "kerben-requests";
const HIDDEN_KEY = "kerben-requests-hidden";
const MAX_LOCAL = 100;
export const REQUESTS_CHANGED = "kerben-requests-changed";

const STATUSES: RequestStatus[] = ["new", "in_progress", "completed", "cancelled"];

function notifyChanged() {
  window.dispatchEvent(new Event(REQUESTS_CHANGED));
}

export function describeSlug(slug: string): { kind: RequestKind; link: string | null } {
  const [prefix, id] = [slug.split("-")[0], slug.split("-").slice(1).join("-")];
  switch (prefix) {
    case "hotel":
      return { kind: "hotel", link: id ? `/hotels/${id}` : "/hotels" };
    case "transport":
      return { kind: "transport", link: id ? `/transport/${id}` : "/transport" };
    case "trekking":
      return { kind: "trekking", link: id ? `/trekking/${id}` : "/trekking" };
    case "helicopter":
      return { kind: "helicopter", link: "/helicopter" };
    case "ai":
      return { kind: "request", link: "/chat" };
    default:
      return { kind: "tour", link: `/tours/${slug}` };
  }
}

function readList<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? (list as T[]) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: unknown[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_LOCAL)));
  } catch {
  }
}

const readLocal = () => readList<MyRequest>(STORAGE_KEY);
const writeLocal = (list: MyRequest[]) => writeList(STORAGE_KEY, list);
const readHidden = () => new Set(readList<string>(HIDDEN_KEY));

/** Номер заявки в backend: «kg-12» (заявка из формы) или «12» (подтверждена в чате) */
export function backendNumber(backendId: string | null | undefined): number | null {
  const match = /^(?:kg-)?(\d{1,9})$/.exec(backendId ?? "");
  return match ? Number(match[1]) : null;
}

const signedIn = () => readSession() !== null;

export async function saveRequest(request: NewRequest): Promise<{ item: MyRequest; signedIn: boolean }> {
  const number = backendNumber(request.backendId);
  const item: MyRequest = { ...request, id: number ? `kg-${number}` : crypto.randomUUID(), status: "new", createdAt: new Date().toISOString() };
  writeLocal([item, ...readLocal().filter((r) => r.id !== item.id)]);
  notifyChanged();
  return { item, signedIn: signedIn() };
}

export const cancelledByMe = new Set<string>();

export async function cancelRequest(item: MyRequest): Promise<void> {
  cancelledByMe.add(item.id);
  const number = backendNumber(item.backendId);
  if (number) await cancelBackendRequest(number);
  writeLocal(readLocal().map((r) => (r.id === item.id ? { ...r, status: "cancelled" } : r)));
  notifyChanged();
}

interface BackendRequest {
  id: number;
  destination: string | null;
  message: string | null;
  name: string | null;
  phone: string | null;
  travel_date: string | null;
  travelers_count: number | null;
  status: string;
  created_at: string;
}

function fromBackend(row: BackendRequest, local: MyRequest | undefined): MyRequest {
  const status = STATUSES.includes(row.status as RequestStatus) ? (row.status as RequestStatus) : "new";
  if (local) return { ...local, status };
  return {
    id: `kg-${row.id}`,
    kind: "request",
    title: row.destination?.trim() || row.message?.trim().slice(0, 120) || `#${row.id}`,
    link: null,
    image: null,
    price: null,
    unit: null,
    backendId: `kg-${row.id}`,
    contactName: row.name,
    contactPhone: row.phone,
    status,
    createdAt: row.created_at,
    details: row.travel_date
      ? { items: [], date: row.travel_date, endDate: "", guests: row.travelers_count, message: row.message ?? "" }
      : null,
  };
}

export function loadRequests(): Promise<{ items: MyRequest[]; signedIn: boolean }> {
  return dedupe("requests:list", loadRequestsNow);
}

async function loadRequestsNow(): Promise<{ items: MyRequest[]; signedIn: boolean }> {
  const hidden = readHidden();
  const local = readLocal().filter((item) => !hidden.has(item.id));
  if (!signedIn()) return { items: local, signedIn: false };

  let rows: BackendRequest[];
  try {
    const data = await chatApi<unknown>("travel-requests/me");
    rows = Array.isArray(data) ? (data as BackendRequest[]) : [];
  } catch (error) {
    if (error instanceof ChatHttpError && error.status === 401) return { items: local, signedIn: false };
    throw error;
  }
  const byId = new Map(local.map((item) => [item.id, item]));
  const fromServer = rows.filter((row) => !hidden.has(`kg-${row.id}`)).map((row) => fromBackend(row, byId.get(`kg-${row.id}`)));
  const known = new Set(fromServer.map((item) => item.id));
  // Заявка ещё не дошла до backend (или без номера) — показываем её из браузера
  const onlyLocal = local.filter((item) => !known.has(item.id) && !backendNumber(item.backendId));
  const items = [...fromServer, ...onlyLocal].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // Статусы с сервера сохраняем, чтобы билет показывал актуальное и без сети
  writeLocal(local.map((item) => fromServer.find((s) => s.id === item.id) ?? item));
  return { items, signedIn: true };
}

export async function hideRequest(id: string): Promise<void> {
  writeList(HIDDEN_KEY, [id, ...readHidden()]);
  writeLocal(readLocal().filter((item) => item.id !== id));
  notifyChanged();
}

export function countActiveRequests(): Promise<number> {
  return dedupe("requests:count", countActiveRequestsNow);
}

async function countActiveRequestsNow(): Promise<number> {
  try {
    const { items } = await loadRequests();
    return items.filter((item) => item.status === "new" || item.status === "in_progress").length;
  } catch {
    return readLocal().filter((item) => item.status === "new" || item.status === "in_progress").length;
  }
}
