import { readSession, userFromProfile, writeSession } from "@/utils/store/auth";

export type AuthErrorCode = "invalid" | "taken" | "notConfirmed" | "badEmail" | "short" | "login" | "phone" | "rateLimit" | "network" | "unknown";

/** Аккаунты клиентов — в backend (/account/*); браузер ходит туда через прокси /api/chat/… */
async function account(path: string, init: { method?: string; body?: unknown; token?: string } = {}): Promise<{ status: number; data: unknown }> {
  const response = await fetch(`/api/chat/account/${path}`, {
    method: init.method ?? "POST",
    headers: {
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  return { status: response.status, data: await response.json().catch(() => null) };
}

const messageOf = (data: unknown): string => {
  const detail = data && typeof data === "object" ? (data as { detail?: unknown }).detail : null;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return "";
};

/** Поле, на которое пожаловалась проверка backend (FastAPI 422: detail[].loc = ["body", "password"]) */
function invalidField(data: unknown): string | null {
  const detail = data && typeof data === "object" ? (data as { detail?: unknown }).detail : null;
  if (!Array.isArray(detail)) return null;
  for (const item of detail) {
    const loc = item && typeof item === "object" ? (item as { loc?: unknown }).loc : null;
    if (Array.isArray(loc) && typeof loc[loc.length - 1] === "string") return loc[loc.length - 1] as string;
  }
  return null;
}

export function toAuthError(status: number, data: unknown): AuthErrorCode {
  const text = messageOf(data).toLowerCase();
  if (status === 0) return "network";
  if (status === 429) return "rateLimit";
  if (status === 422) {
    const field = invalidField(data);
    if (field === "password" || field === "new_password") return "short";
    if (field === "username") return "login";
    if (field === "phone") return "phone";
    if (field === "email") return "badEmail";
    return "unknown";
  }
  if (/already|exists|taken|занят|существует|зарегистр/.test(text) || status === 409) return "taken";
  if (status === 401 || status === 403 || /invalid|неверн|password|парол/.test(text)) return "invalid";
  if (status === 422 && /email/.test(text)) return "badEmail";
  return "unknown";
}

const tokenOf = (data: unknown): string | null => {
  const source = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const value = [source.access_token, source.token, source.access].find((v): v is string => typeof v === "string" && v !== "");
  return value ?? null;
};

async function call(path: string, init: Parameters<typeof account>[1]) {
  try {
    return await account(path, init);
  } catch {
    return { status: 0, data: null };
  }
}

async function startSession(token: string, known: { email?: string; name?: string }, data: unknown): Promise<{ error?: AuthErrorCode }> {
  const me = await call("me", { method: "GET", token });
  const user = userFromProfile(me.status === 200 ? me.data : data, known);
  if (!user) return { error: "unknown" };
  writeSession({ token, user });
  return {};
}

/** Вход по логину или email: backend ищет по полю, которое пришло (`username` или `email`) */
export async function signIn(login: string, password: string): Promise<{ error?: AuthErrorCode }> {
  const value = login.trim();
  const byEmail = value.includes("@");
  const { status, data } = await call("login", { body: byEmail ? { email: value, password } : { username: value, password } });
  const token = status >= 200 && status < 300 ? tokenOf(data) : null;
  if (!token) return { error: toAuthError(status === 200 ? 500 : status, data) };
  return startSession(token, byEmail ? { email: value } : { name: value }, data);
}

/** Backend регистрирует только по логину и паролю; ответ 201 сразу содержит токен */
export async function signUp(login: string, password: string): Promise<{ error?: AuthErrorCode }> {
  const username = login.trim();
  const { status, data } = await call("register", { body: { username, password } });
  if (status < 200 || status >= 300) return { error: toAuthError(status, data) };
  const token = tokenOf(data);
  if (token) return startSession(token, { name: username }, data);
  return signIn(username, password);
}

/** В backend нет метода «изменить профиль» — телефон из заявки запоминаем в сессии браузера */
export function savePhone(phone: string): void {
  const value = phone.trim();
  const session = readSession();
  if (!value || !session) return;
  writeSession({ ...session, user: { ...session.user, phone: value } });
}

export async function signOut(): Promise<void> {
  writeSession(null);
}

export async function requestPasswordReset(email: string): Promise<{ error?: AuthErrorCode }> {
  const { status, data } = await call("forgot-password", { body: { email: email.trim() } });
  return status >= 200 && status < 300 ? {} : { error: toAuthError(status, data) };
}

/** Новый пароль по токену из письма backend */
export async function resetPassword(token: string, password: string): Promise<{ error?: AuthErrorCode }> {
  const { status, data } = await call("reset-password", { body: { token, new_password: password } });
  return status >= 200 && status < 300 ? {} : { error: toAuthError(status, data) };
}
