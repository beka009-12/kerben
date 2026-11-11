import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
}));

import { AdminAuthError, adminFetch, adminLogin, adminMe, listRecords } from "@/utils/admin/api";
import { RESOURCES } from "@/utils/admin/resources";
import { requireAdmin } from "@/utils/admin/session";

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
const call = (f: ReturnType<typeof mockFetch>, i = 0) => f.mock.calls[i] as unknown as [string, RequestInit & { headers: Record<string, string> }];

beforeEach(() => cookieStore.get.mockReset());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("backend админки", () => {
  it("adminLogin шлёт username/password и возвращает токен", async () => {
    const f = mockFetch(200, { access_token: "T", token_type: "bearer" });
    expect(await adminLogin("boss@kg.kg", "pw")).toBe("T");
    const [url, init] = call(f);
    expect(url).toMatch(/\/admin\/login\/$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ username: "boss@kg.kg", password: "pw" });
  });

  it("adminLogin: неверные данные и сетевая ошибка → null", async () => {
    mockFetch(401, { detail: "bad" });
    expect(await adminLogin("a@b.kg", "x")).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await adminLogin("a@b.kg", "x")).toBeNull();
  });

  it("adminMe: профиль с токеном, 401 → null", async () => {
    const f = mockFetch(200, { id: 1, username: "boss", is_active: true, created_at: "2026-01-01" });
    expect(await adminMe("T")).toEqual({ id: 1, username: "boss" });
    expect(call(f)[1].headers.Authorization).toBe("Bearer T");
    mockFetch(401, { detail: "expired" });
    expect(await adminMe("T")).toBeNull();
  });

  it("adminMe: сбой сети или 5xx — не выход из админки", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await adminMe("T")).toBe("unavailable");
    mockFetch(502, { detail: "bad gateway" });
    expect(await adminMe("T")).toBe("unavailable");
  });

  it("adminFetch ставит Bearer и превращает 401 в AdminAuthError", async () => {
    const f = mockFetch(200, []);
    await adminFetch("T", "/tours/");
    expect(call(f)[1].headers.Authorization).toBe("Bearer T");
    mockFetch(401, { detail: "expired" });
    await expect(adminFetch("T", "/tours/")).rejects.toBeInstanceOf(AdminAuthError);
  });

  it("listRecords добавляет lang=ru только разделам с usesLang", async () => {
    const f = mockFetch(200, [{ id: 1 }]);
    expect(await listRecords("T", RESOURCES.transports)).toEqual([{ id: 1 }]);
    expect(call(f, 0)[0]).toMatch(/\/transports\/\?lang=ru$/);
    await listRecords("T", RESOURCES.transportImages);
    expect(call(f, 1)[0]).toMatch(/\/transport-images\/$/);
  });

  it("requireAdmin без cookie → на вход, в backend не ходит", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const f = mockFetch(200, {});
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT /ru/admin/login");
    expect(f).not.toHaveBeenCalled();
  });

  it("requireAdmin с истёкшим токеном → на вход", async () => {
    cookieStore.get.mockReturnValue({ value: "OLD" });
    mockFetch(401, { detail: "expired" });
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT /ru/admin/login");
  });

  it("requireAdmin с верным токеном → профиль и токен", async () => {
    cookieStore.get.mockReturnValue({ value: "T" });
    mockFetch(200, { id: 1, username: "boss", is_active: true, created_at: "2026-01-01" });
    expect(await requireAdmin()).toEqual({ admin: { id: 1, username: "boss" }, token: "T" });
  });
});
