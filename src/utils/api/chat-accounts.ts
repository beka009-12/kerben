import "server-only";
import { createHmac, createHash } from "node:crypto";
import { BACKEND_URL } from "./backend";
import { ApiError, apiFetch } from "./client";

const SECRET = process.env.CHAT_ACCOUNT_SECRET || process.env.KERBEN_SITE_PASSWORD || process.env.KYRGYZGO_SITE_PASSWORD || "";
const TOKEN_TTL_MS = 20 * 60_000;
const tokens = new Map<string, { value: string; until: number }>();
const pending = new Map<string, Promise<string>>();

export const chatAccountsReady = () => SECRET !== "";

export class ChatAccountError extends Error {
  constructor(
    public readonly code: "unauthorized" | "notConfigured" | "server",
    message: string,
  ) {
    super(message);
  }
}

interface SiteUser {
  id: string;
  email: string | null;
  /** Токен клиента backend (/account/login), с которым пришёл браузер */
  token: string;
}

const text = (value: unknown) => (typeof value === "string" || typeof value === "number" ? String(value).trim() : "");

/** Пользователь сайта по его токену backend (из заголовка Authorization) */
export async function siteUserFrom(request: Request): Promise<SiteUser> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new ChatAccountError("unauthorized", "no session");
  let data: Record<string, unknown> | null;
  try {
    data = await apiFetch<Record<string, unknown>>(`${BACKEND_URL}/account/me`, { headers: { Authorization: `Bearer ${token}` }, timeoutMs: 8000, cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) throw new ChatAccountError("unauthorized", "session expired");
    throw error;
  }
  const source = data && typeof data.user === "object" && data.user ? (data.user as Record<string, unknown>) : (data ?? {});
  const email = text(source.email) || null;
  const id = text(source.id) || text(source.user_id) || text(source.client_id) || (email ? `email:${email.toLowerCase()}` : "");
  if (!id) throw new ChatAccountError("unauthorized", "no user");
  return { id, email, token };
}

export function chatCredentials(userId: string, secret = SECRET) {
  const username = `site_${createHash("sha256").update(userId).digest("hex").slice(0, 24)}`;
  const password = createHmac("sha256", secret).update(`kerben-chat:${userId}`).digest("base64url");
  return { username, password };
}

const tokenOf = (data: Record<string, unknown> | null) => (typeof data?.access_token === "string" && data.access_token ? data.access_token : null);

/** Принимает ли чат backend токен аккаунта напрямую (один аккаунт на сайт и чат) */
async function accountTokenWorks(token: string): Promise<boolean> {
  try {
    await apiFetch(`${BACKEND_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, timeoutMs: 8000, cache: "no-store" });
    return true;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return false;
    throw error;
  }
}

/** Иначе — отдельный аккаунт чата: логин и пароль выводятся из id пользователя и секрета */
async function loginOrRegister(user: SiteUser): Promise<string> {
  if (!chatAccountsReady()) throw new ChatAccountError("notConfigured", "CHAT_ACCOUNT_SECRET is not set");
  const { username, password } = chatCredentials(user.id);
  const call = (path: string, body: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`${BACKEND_URL}${path}`, { method: "POST", body, timeoutMs: 8000 });
  try {
    const token = tokenOf(await call("/auth/login", { username, password }));
    if (token) return token;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }
  try {
    const token = tokenOf(await call("/auth/register", { username, password, ...(user.email ? { email: user.email } : {}) }));
    if (token) return token;
  } catch (error) {
    // Такой email уже занят другим аккаунтом backend — заводим без email
    if (!(error instanceof ApiError) || error.status !== 409 || !user.email) throw error;
    const token = tokenOf(await call("/auth/register", { username, password }));
    if (token) return token;
  }
  throw new ChatAccountError("server", "no token in backend response");
}

/** Клиентский токен чата backend для пользователя сайта (кэш на 20 минут) */
export async function chatTokenFor(user: SiteUser, fresh = false): Promise<string> {
  const cached = tokens.get(user.id);
  if (!fresh && cached && cached.until > Date.now()) return cached.value;
  const running = pending.get(user.id);
  if (running) return running;
  const job = (async () => ((await accountTokenWorks(user.token)) ? user.token : loginOrRegister(user)))()
    .then((value) => {
      tokens.set(user.id, { value, until: Date.now() + TOKEN_TTL_MS });
      return value;
    })
    .finally(() => pending.delete(user.id));
  pending.set(user.id, job);
  return job;
}
