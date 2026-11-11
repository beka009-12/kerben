import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/store/auth", () => ({ sessionToken: () => "site-token" }));

import { ChatSocket, forgetChatToken, type ChatEvent } from "@/utils/ai/backend-chat";
import { chatErrorCode } from "@/utils/assistant";
import { chatCredentials } from "@/utils/api/chat-accounts";
import { GET, POST } from "@/app/api/chat/[...path]/route";

class FakeSocket {
  static all: FakeSocket[] = [];
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  constructor(readonly url: string) {
    FakeSocket.all.push(this);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {}
  server(event: Record<string, unknown>) {
    this.onmessage?.({ data: JSON.stringify(event) });
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  FakeSocket.all = [];
  forgetChatToken();
  vi.stubGlobal("WebSocket", FakeSocket);
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ token: "client-token" })));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("websocket чата backend", () => {
  it("первым кадром шлёт токен, сообщения — только после connected", async () => {
    const events: ChatEvent[] = [];
    const socket = new ChatSocket("abc", { onEvent: (e) => events.push(e), onReconnect: vi.fn(), onFail: vi.fn() });
    await flush();
    const ws = FakeSocket.all[0];
    expect(ws.url).toBe("wss://13.49.104.87/ws/chat/abc");
    ws.onopen?.();
    expect(JSON.parse(ws.sent[0])).toEqual({ type: "auth", token: "client-token" });

    const sending = socket.send("Хочу в Каракол");
    await flush();
    expect(ws.sent).toHaveLength(1);
    ws.server({ type: "connected", session_id: "abc" });
    await sending;
    expect(JSON.parse(ws.sent[1])).toEqual({ type: "message", message: "Хочу в Каракол" });

    ws.server({ type: "message_delta", message_id: "m1", delta: "Привет" });
    expect(events).toEqual([{ type: "message_delta", message_id: "m1", delta: "Привет" }]);
    socket.close();
  });

  it("устаревший токен — берёт свежий и подключается заново", async () => {
    const onFail = vi.fn();
    const socket = new ChatSocket("abc", { onEvent: vi.fn(), onReconnect: vi.fn(), onFail });
    await flush();
    FakeSocket.all[0].server({ type: "error", code: "authentication_failed" });
    await flush();
    expect(FakeSocket.all).toHaveLength(2);
    expect(vi.mocked(fetch).mock.calls.at(-1)?.[0]).toBe("/api/chat/token?fresh=1");
    expect(onFail).not.toHaveBeenCalled();
    socket.close();
  });

  it("обрыв связи — переподключение и сигнал перечитать историю", async () => {
    vi.useFakeTimers();
    const onReconnect = vi.fn();
    const socket = new ChatSocket("abc", { onEvent: vi.fn(), onReconnect, onFail: vi.fn() });
    await vi.advanceTimersByTimeAsync(0);
    FakeSocket.all[0].server({ type: "connected", session_id: "abc" });
    FakeSocket.all[0].onclose?.({ code: 1006 });
    await vi.advanceTimersByTimeAsync(2000);
    expect(FakeSocket.all).toHaveLength(2);
    FakeSocket.all[1].server({ type: "connected", session_id: "abc" });
    expect(onReconnect).toHaveBeenCalledTimes(1);
    socket.close();
  });

  it("коды ошибок backend превращаются в понятные тексты", () => {
    expect(chatErrorCode("rate_limited")).toBe("dailyLimit");
    expect(chatErrorCode("ai_busy")).toBe("busy");
    expect(chatErrorCode("ai_unavailable")).toBe("notConfigured");
    expect(chatErrorCode("что-то новое")).toBe("server");
  });
});

describe("аккаунт чата на backend", () => {
  it("логин и пароль одинаковы для одного пользователя и разные для разных", () => {
    const a = chatCredentials("user-1", "secret");
    expect(chatCredentials("user-1", "secret")).toEqual(a);
    expect(chatCredentials("user-2", "secret").username).not.toBe(a.username);
    expect(chatCredentials("user-1", "other").password).not.toBe(a.password);
    expect(a.username).toMatch(/^[a-z0-9_]{3,50}$/);
    expect(a.password.length).toBeGreaterThanOrEqual(8);
  });
});

describe("прокси /api/chat/*", () => {
  const ctx = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });

  it("пускает только маршруты чата", async () => {
    const res = await GET(new Request("http://localhost/api/chat/admin/requests", { headers: { authorization: "Bearer t" } }), ctx("admin/requests"));
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("передаёт токен клиента и тело, возвращает ответ backend", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ status: "submitted", request_id: 7 }));
    const res = await POST(
      new Request("http://localhost/api/chat/booking/confirm", {
        method: "POST",
        headers: { authorization: "Bearer t", "content-type": "application/json" },
        body: JSON.stringify({ session_id: "s", revision: 3, confirmed: true }),
      }),
      ctx("booking/confirm"),
    );
    expect(await res.json()).toEqual({ status: "submitted", request_id: 7 });
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/booking\/confirm$/);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer t");
    expect(JSON.parse(String(init.body))).toEqual({ session_id: "s", revision: 3, confirmed: true });
  });

  it("без токена — 401, на backend не ходит", async () => {
    const res = await GET(new Request("http://localhost/api/chat/chat/sessions"), ctx("chat/sessions"));
    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
});
