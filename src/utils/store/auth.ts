import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
}

interface AuthState {
  status: "loading" | "guest" | "user";
  user: AuthUser | null;
}

export const useAuth = create<AuthState>(() => ({ status: "loading", user: null }));

/** Сессия клиента backend (/account/login): токен и профиль хранятся в браузере */
export const SESSION_KEY = "kerben-session";

export interface StoredSession {
  token: string;
  user: AuthUser;
}

export function readSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const data = raw ? (JSON.parse(raw) as Partial<StoredSession>) : null;
    if (!data || typeof data.token !== "string" || !data.token || !data.user || typeof data.user.id !== "string") return null;
    return data as StoredSession;
  } catch {
    return null;
  }
}

export function sessionToken(): string | null {
  return readSession()?.token ?? null;
}

export function writeSession(session: StoredSession | null) {
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
  }
  applySession(session);
}

function applySession(session: StoredSession | null) {
  useAuth.setState(session ? { status: "user", user: session.user } : { status: "guest", user: null });
}

/** Профиль из ответа backend: поля называются по-разному, берём то, что есть */
export function userFromProfile(data: unknown, fallback: Partial<AuthUser> = {}): AuthUser | null {
  const source = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const nested = source.user && typeof source.user === "object" ? (source.user as Record<string, unknown>) : {};
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = nested[key] ?? source[key];
      if ((typeof value === "string" && value.trim()) || typeof value === "number") return String(value).trim();
    }
    return "";
  };
  const email = pick("email") || fallback.email || "";
  const id = pick("id", "user_id", "client_id", "pk") || fallback.id || (email ? `email:${email.toLowerCase()}` : "");
  if (!id) return null;
  const name = pick("name", "full_name", "first_name", "username") || fallback.name || email.split("@")[0] || "";
  const phone = pick("phone", "phone_number") || fallback.phone || "";
  return { id, email, name, phone };
}

/** Проверка токена при загрузке: backend отказал (401) — выходим, нет связи — оставляем сессию */
async function verify(session: StoredSession) {
  try {
    const response = await fetch("/api/chat/account/me", { headers: { Authorization: `Bearer ${session.token}` }, cache: "no-store" });
    if (response.status === 401 || response.status === 403) {
      if (sessionToken() === session.token) writeSession(null);
      return;
    }
    if (!response.ok) return;
    const user = userFromProfile(await response.json().catch(() => null), session.user);
    if (user && sessionToken() === session.token) writeSession({ token: session.token, user: { ...user, phone: user.phone || session.user.phone } });
  } catch {
  }
}

export function startAuth(): () => void {
  const session = readSession();
  applySession(session);
  if (session) void verify(session);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY) applySession(readSession());
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
