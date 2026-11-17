import "server-only";
import { BACKEND_URL } from "./backend";
import { ApiError, apiFetch } from "./client";

export class ChatAccountError extends Error {
  constructor(
    public readonly code: "unauthorized",
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
