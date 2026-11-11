import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/store/auth", async (importOriginal) => ({ ...(await importOriginal<object>()), sessionToken: () => "site-token" }));

import { DELETE, GET, POST } from "@/app/api/chat/[...path]/route";
import { forgetChatToken } from "@/utils/ai/backend-chat";
import { backendTourId, selectionFromSlug, sendBackendRequest } from "@/utils/api/client-backend";

const ctx = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });

beforeEach(() => forgetChatToken());
afterEach(() => vi.unstubAllGlobals());

describe("что бронируют, по slug", () => {
  it("тур из backend — число, отель и машина — с приставкой, демо-тур — не backend", () => {
    expect(backendTourId("12")).toBe(12);
    expect(backendTourId("ala-archa")).toBeNull();
    expect(selectionFromSlug("12")).toEqual({ tour_id: 12 });
    expect(selectionFromSlug("hotel-5")).toEqual({ hotel_id: 5 });
    expect(selectionFromSlug("transport-7")).toEqual({ transport_id: 7 });
    expect(selectionFromSlug("ala-archa")).toBeNull();
    expect(selectionFromSlug("helicopter-3")).toBeNull();
  });
});

describe("прокси к backend: отзывы и заявки", () => {
  it("отзывы читаются без входа, адрес со слэшем на конце", async () => {
    const fetch = vi.fn(async () => Response.json([{ id: 1, display_name: "Аня", rating: 5, text: "Супер", created_at: "2026-11-01T00:00:00Z" }]));
    vi.stubGlobal("fetch", fetch);
    const res = await GET(new Request("http://localhost/api/chat/tours/4/reviews"), ctx("tours/4/reviews"));
    expect(res.status).toBe(200);
    expect(String((fetch.mock.calls[0] as unknown[])[0])).toMatch(/\/tours\/4\/reviews\/$/);
  });

  it("написать или удалить отзыв, отменить заявку — только со входом", async () => {
    vi.stubGlobal("fetch", vi.fn());
    expect((await POST(new Request("http://localhost/api/chat/tours/4/reviews", { method: "POST" }), ctx("tours/4/reviews"))).status).toBe(401);
    expect((await DELETE(new Request("http://localhost/api/chat/tours/4/reviews/9", { method: "DELETE" }), ctx("tours/4/reviews/9"))).status).toBe(401);
    expect((await DELETE(new Request("http://localhost/api/chat/travel-requests/me/3", { method: "DELETE" }), ctx("travel-requests/me/3"))).status).toBe(401);
  });

  it("чужие адреса backend через прокси недоступны", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const res = await GET(new Request("http://localhost/api/chat/travel-requests", { headers: { authorization: "Bearer t" } }), ctx("travel-requests"));
    expect(res.status).toBe(404);
  });
});

describe("заявка в backend", () => {
  it("сначала подборка, потом заявка с её id", async () => {
    const calls: { url: string; body: unknown }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.startsWith("/api/chat/token")) return Response.json({ token: "client-token" });
        calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null });
        return url.endsWith("travel-selections") ? Response.json({ id: 41 }) : Response.json({ id: 77 }, { status: 201 });
      }),
    );
    const id = await sendBackendRequest({ tour_id: 12 }, { travel_date: "2026-12-20", travelers_count: 2, phone: "+996700000000", message: null });
    expect(id).toBe(77);
    expect(calls.map((c) => c.url)).toEqual(["/api/chat/travel-selections", "/api/chat/travel-requests"]);
    expect(calls[0].body).toEqual({ tour_id: 12 });
    expect(calls[1].body).toMatchObject({ selection_id: 41, travel_date: "2026-12-20", travelers_count: 2 });
  });
});
