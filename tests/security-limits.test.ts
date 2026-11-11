import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/chat/[...path]/route";
import { backendImage } from "@/utils/api/backend";
import { createRateLimit } from "@/utils/api/rate-limit";

afterEach(() => vi.unstubAllGlobals());

const login = (ip: string) =>
  POST(new Request("http://localhost/api/chat/account/login", { method: "POST", headers: { "x-forwarded-for": ip }, body: JSON.stringify({ email: "a@b.kg", password: "x" }) }), {
    params: Promise.resolve({ path: ["account", "login"] }),
  });

describe("ограничения безопасности", () => {
  it("лимит попыток: окно скользит, после паузы снова можно", () => {
    const allow = createRateLimit({ limit: 2, windowMs: 1000 });
    expect(allow("ip", 0)).toBe(true);
    expect(allow("ip", 10)).toBe(true);
    expect(allow("ip", 20)).toBe(false);
    expect(allow("other", 20)).toBe(true);
    expect(allow("ip", 1011)).toBe(true);
  });

  it("вход клиента: после 10 попыток с одного IP — 429 без запроса в backend", async () => {
    const fetchMock = vi.fn(async () => Response.json({ detail: "bad" }, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);
    for (let i = 0; i < 10; i++) expect((await login("198.51.100.9")).status).toBe(401);
    const blocked = await login("198.51.100.9");
    expect(blocked.status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(10);
    expect((await login("198.51.100.10")).status).toBe(401);
  });

  it("картинки только с backend, Unsplash и Wikimedia", () => {
    expect(backendImage("https://images.unsplash.com/photo-1")).toBe("https://images.unsplash.com/photo-1");
    expect(backendImage("https://upload.wikimedia.org/a.jpg")).toBe("https://upload.wikimedia.org/a.jpg");
    expect(backendImage("https://evil.example.com/a.jpg")).toBeNull();
    expect(backendImage("/media/a.jpg")).toMatch(/\/media\/a\.jpg$/);
  });
});
