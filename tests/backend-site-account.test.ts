import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("служебный вход сайта в бэкенд", () => {
  it("без переменных окружения запросы идут без токена", async () => {
    const fetch = vi.fn().mockResolvedValue(json([]));
    vi.stubGlobal("fetch", fetch);
    const { backendFetch, hasSiteAccount } = await import("@/utils/api/backend");
    expect(hasSiteAccount()).toBe(false);
    await backendFetch("/hotel-images/");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("с аккаунтом входит один раз и шлёт Bearer, на 401 входит заново", async () => {
    vi.stubEnv("KERBEN_SITE_EMAIL", "site@example.test");
    vi.stubEnv("KERBEN_SITE_PASSWORD", "test-password");
    let logins = 0;
    const fetch = vi.fn(async (url: string, init: RequestInit & { headers: Record<string, string> }) => {
      if (url.endsWith("/account/login")) return json({ access_token: `t${++logins}` });
      if (init.headers.Authorization === "Bearer t1" && url.includes("/expired")) return json({ detail: "expired" }, 401);
      return json({ ok: init.headers.Authorization });
    });
    vi.stubGlobal("fetch", fetch);
    const { backendFetch } = await import("@/utils/api/backend");

    expect(await backendFetch("/hotels/1/")).toEqual({ ok: "Bearer t1" });
    expect(await backendFetch("/hotels/2/")).toEqual({ ok: "Bearer t1" });
    expect(logins).toBe(1);
    expect(await backendFetch("/expired")).toEqual({ ok: "Bearer t2" });
    expect(logins).toBe(2);
  });

  it("POST-запросы не получают служебный токен", async () => {
    vi.stubEnv("KERBEN_SITE_EMAIL", "site@example.test");
    vi.stubEnv("KERBEN_SITE_PASSWORD", "test-password");
    const fetch = vi.fn().mockResolvedValue(json({}));
    vi.stubGlobal("fetch", fetch);
    const { backendFetch } = await import("@/utils/api/backend");
    await backendFetch("/something/", { method: "POST", body: {} });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
});

describe("описание тура без входа", () => {
  it("берётся из открытых слайдов главной", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const card = { id: 7, price: "100.00", price_unit: "per_person", main_image: null, title: "Ала-Арча", category_id: null, duration_days: 1, duration_nights: 0, tour_type: "classic" };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/tours/home/slides/")) return json({ total: 1, slides: [{ id: 7, title: "Ала-Арча", description: "Ущелье рядом с Бишкеком. Водопад." }] });
        if (url.includes("/tours/?")) return json([card]);
        return json([]);
      }),
    );
    const { loadBackendTours } = await import("@/utils/api/tours");
    const tours = await loadBackendTours("ru");
    expect(tours?.[0].overview).toBe("Ущелье рядом с Бишкеком. Водопад.");
    expect(tours?.[0].summary).toBe("Ущелье рядом с Бишкеком.");
  });
});
