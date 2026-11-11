"use client";

import { chatSocketUrl } from "@/config/chat";
import { sessionToken } from "@/utils/store/auth";

/** Ошибка запроса к чату backend: status 0 — нет сети, detail — тело ответа */
export class ChatHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: unknown,
  ) {
    super(`chat request failed: ${status}`);
  }
}

let token: Promise<string> | null = null;
/** Для какой сессии сайта получен токен чата: сменился вход — берём новый */
let tokenFor: string | null = null;

async function requestToken(fresh: boolean, access: string | null): Promise<string> {
  if (!access) throw new ChatHttpError(401, { error: "unauthorized" });
  const response = await fetch(`/api/chat/token${fresh ? "?fresh=1" : ""}`, { method: "POST", headers: { Authorization: `Bearer ${access}` } });
  const body = (await response.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!response.ok || !body.token) throw new ChatHttpError(response.status, body);
  return body.token;
}

/** Клиентский токен backend для чата; хранится только в памяти вкладки */
export function chatToken(fresh = false): Promise<string> {
  const access = sessionToken();
  if (fresh || !token || tokenFor !== access) {
    tokenFor = access;
    token = requestToken(fresh, access);
    token.catch(() => (token = null));
  }
  return token;
}

export function forgetChatToken() {
  token = null;
}

/** HTTP-запрос чата через прокси сайта; при 401 один раз берёт свежий токен */
export async function chatApi<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const call = async (value: string) => {
    let response: Response;
    try {
      response = await fetch(`/api/chat/${path}`, {
        method: init.method ?? "GET",
        headers: { Authorization: `Bearer ${value}`, ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}) },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      });
    } catch (error) {
      throw new ChatHttpError(0, error);
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new ChatHttpError(response.status, data);
    return data as T;
  };
  try {
    return await call(await chatToken());
  } catch (error) {
    if (!(error instanceof ChatHttpError) || error.status !== 401) throw error;
    return call(await chatToken(true));
  }
}

export interface BookingPreview {
  status: string;
  session_id: string;
  revision: number;
  data: {
    client_name?: string | null;
    phone?: string | null;
    email?: string | null;
    people_count?: number | null;
    travel_date?: string | null;
    duration_days?: number | null;
    destination?: string | null;
    selected_services?: { kind: string; id: number; name: string }[];
  };
  missing_fields: string[];
  complete: boolean;
  can_confirm: boolean;
}

export type ChatEvent =
  | { type: "connected"; session_id: string }
  | { type: "typing"; status: boolean }
  | { type: "message_start"; message_id: string }
  | { type: "message_delta"; message_id: string; delta: string }
  | { type: "message_end"; message_id: string; revision?: number; booking_intent?: boolean; stage?: string }
  | ({ type: "booking_preview" } & BookingPreview)
  | { type: "booking_submitted"; status: string; request_id: number | string; client_code?: string }
  | { type: "error"; code: string; message?: string; retry_after?: number };

export interface ChatSocketHandlers {
  onEvent: (event: ChatEvent) => void;
  /** Связь вернулась после обрыва — стоит перечитать историю */
  onReconnect: () => void;
  /** Сокет закрыт сервером навсегда (чужая/удалённая беседа, нет входа) */
  onFail: (code: "unauthorized" | "load") => void;
}

const MAX_BACKOFF_MS = 15_000;

/**
 * Websocket одной беседы: первым кадром — токен, дальше сообщения.
 * Обрыв — переподключение с растущей паузой (у backend лимит 30 рукопожатий в минуту).
 */
export class ChatSocket {
  private ws: WebSocket | null = null;
  private closed = false;
  private attempts = 0;
  private everConnected = false;
  private retriedAuth = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private waiters: { resolve: () => void; reject: (error: Error) => void }[] = [];
  private ready = false;

  constructor(
    readonly sessionId: string,
    private readonly handlers: ChatSocketHandlers,
  ) {
    void this.connect(false);
  }

  private async connect(freshToken: boolean) {
    if (this.closed) return;
    let value: string;
    try {
      value = await chatToken(freshToken);
    } catch (error) {
      if (error instanceof ChatHttpError && error.status === 401) return this.fail("unauthorized");
      return this.retry();
    }
    if (this.closed) return;
    const ws = new WebSocket(`${chatSocketUrl}/ws/chat/${encodeURIComponent(this.sessionId)}`);
    this.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token: value }));
    ws.onmessage = ({ data }) => {
      if (typeof data !== "string") return;
      let event: ChatEvent;
      try {
        event = JSON.parse(data) as ChatEvent;
      } catch {
        return;
      }
      if (event.type === "connected") {
        const again = this.everConnected;
        this.ready = true;
        this.everConnected = true;
        this.attempts = 0;
        this.retriedAuth = false;
        this.waiters.splice(0).forEach((w) => w.resolve());
        if (again) this.handlers.onReconnect();
        return;
      }
      if (event.type === "error" && (event.code === "authentication_failed" || event.code === "session_expired")) {
        // Токен устарел — один раз берём новый и подключаемся заново
        if (!this.retriedAuth) {
          this.retriedAuth = true;
          this.drop();
          void this.connect(true);
          return;
        }
        return this.fail("unauthorized");
      }
      if (event.type === "error" && event.code === "session_not_found") return this.fail("load");
      this.handlers.onEvent(event);
    };
    ws.onclose = (event) => {
      if (this.ws !== ws) return;
      this.ready = false;
      this.ws = null;
      if (this.closed) return;
      // 1008 — отказ по политике: если так и не подключились за несколько попыток, дальше не стучимся
      if (event.code === 1008 && !this.ready && this.attempts >= 3) return this.fail("load");
      this.retry();
    };
  }

  private retry() {
    if (this.closed) return;
    const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** this.attempts) + Math.random() * 400;
    this.attempts += 1;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.connect(false), delay);
  }

  private drop() {
    const ws = this.ws;
    this.ws = null;
    this.ready = false;
    if (ws) {
      ws.onclose = null;
      ws.close();
    }
  }

  private fail(code: "unauthorized" | "load") {
    this.close();
    this.handlers.onFail(code);
  }

  private whenReady(): Promise<void> {
    if (this.ready) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.waiters.push({ resolve, reject });
      setTimeout(() => reject(new Error("socket timeout")), 20_000);
    });
  }

  async send(message: string) {
    await this.whenReady();
    this.ws?.send(JSON.stringify({ type: "message", message: message.slice(0, 2000) }));
  }

  close() {
    this.closed = true;
    clearTimeout(this.timer);
    this.drop();
    this.waiters.splice(0).forEach((w) => w.reject(new Error("socket closed")));
  }
}
