import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() }));
const headerStore = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore, headers: async () => headerStore }));
vi.mock("next/cache", () => ({ updateTag: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(), notFound: vi.fn() }));

import { adminSignIn, saveRecord } from "@/app/[lang]/admin/actions";
import { adminLogin } from "@/utils/admin/api";
import { toFormValues } from "@/utils/admin/form";
import { RESOURCES } from "@/utils/admin/resources";

function mockFetch(status: number, body: unknown) {
  const f = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", f);
  return f;
}

beforeEach(() => {
  cookieStore.get.mockReturnValue({ value: "T" });
  headerStore.get.mockReturnValue("203.0.113.7");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("исправления по ревью", () => {
  it("adminSignIn: после 5 неудач с одного IP — дальше в backend не ходит", async () => {
    const f = mockFetch(401, { detail: "bad" });
    for (let i = 0; i < 5; i++) await adminSignIn(`guess${i}@x.kg`, "pw");
    expect(f).toHaveBeenCalledTimes(5);
    expect(await adminSignIn("guess@x.kg", "pw")).toEqual({ ok: false, error: "rate" });
    expect(f).toHaveBeenCalledTimes(5);
  });

  it("saveRecord: id не целое число — отказ без запроса", async () => {
    const f = mockFetch(200, {});
    expect(await saveRecord("tours", "1/../../admin" as never, { ...toFormValues(RESOURCES.tours, null), title: "T", price: "10" }, toFormValues(RESOURCES.tours, null))).toMatchObject({ ok: false, error: "validation" });
    expect(f).not.toHaveBeenCalled();
  });

  it("saveRecord: значения не той формы — отказ без запроса", async () => {
    const f = mockFetch(200, {});
    expect(await saveRecord("hotels", null, { ...toFormValues(RESOURCES.hotels, null), name: "H", region_id: "1", district_id: "1", price: "5", amenities: [1, 2] } as never, null)).toMatchObject({ ok: false, error: "validation" });
    expect(f).not.toHaveBeenCalled();
  });

  it("adminLogin: зависший backend — ответ null не позже чем через 3 секунды", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_u: string, init?: RequestInit) => new Promise((_r, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))))));
    const result = adminLogin("a@b.kg", "pw");
    await vi.advanceTimersByTimeAsync(3000);
    expect(await result).toBeNull();
  });
});
