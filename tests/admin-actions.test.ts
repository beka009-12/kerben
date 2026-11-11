import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() }));
const updateTag = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: async () => cookieStore, headers: async () => new Headers({ "x-forwarded-for": "198.51.100.1" }) }));
vi.mock("next/cache", () => ({ updateTag }));
vi.mock("next/navigation", () => ({ redirect, notFound: vi.fn() }));

import { adminSignIn, adminSignOut, deleteRecord, retranslateTour, saveRecord, setRequestStatus } from "@/app/[lang]/admin/actions";
import { toFormValues } from "@/utils/admin/form";
import { RESOURCES } from "@/utils/admin/resources";

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
const call = (f: ReturnType<typeof mockFetch>, i = 0) => f.mock.calls[i] as [string, RequestInit];
const body = (f: ReturnType<typeof mockFetch>, i = 0) => JSON.parse(String(call(f, i)[1].body));

beforeEach(() => {
  cookieStore.get.mockReturnValue({ value: "T" });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("вход и выход", () => {
  const only = (jar: Record<string, string>) => cookieStore.get.mockImplementation((name: string) => (name in jar ? { value: jar[name] } : undefined));
  const setCall = (name: string) => cookieStore.set.mock.calls.find((c) => c[0] === name);

  beforeEach(() => only({}));

  it("adminSignIn: успех ставит access на expires_in и refresh до refresh_expires_at, httpOnly", async () => {
    const at = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    mockFetch(200, { access_token: "A", expires_in: 3600, refresh_token: "R", refresh_expires_at: at });
    expect(await adminSignIn("boss@kg.kg", "pw")).toEqual({ ok: true });
    expect(setCall("kg_admin")).toEqual(["kg_admin", "A", expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 3600 })]);
    const refresh = setCall("kg_admin_refresh");
    expect(refresh?.[1]).toBe("R");
    expect(refresh?.[2].maxAge).toBeGreaterThan(2 * 24 * 60 * 60 - 60);
    expect(refresh?.[2].maxAge).toBeLessThanOrEqual(2 * 24 * 60 * 60);
    expect(setCall("kg_admin_device")).toBeUndefined();
  });

  it("adminSignIn: код уходит как totp_code без пробелов, «доверять» — remember_device, device_token на 30 дней", async () => {
    const f = mockFetch(200, { access_token: "A", expires_in: 3600, device_token: "D", device_id: 7 });
    expect(await adminSignIn("boss@kg.kg", "pw", " 123 456 ", true)).toEqual({ ok: true });
    expect(body(f)).toEqual({ username: "boss@kg.kg", password: "pw", totp_code: "123456", remember_device: true });
    expect(setCall("kg_admin_device")).toEqual(["kg_admin_device", "D", expect.objectContaining({ httpOnly: true, maxAge: 30 * 24 * 60 * 60 })]);
  });

  it("adminSignIn: доверенный браузер — device_token из cookie уходит в backend, кода нет", async () => {
    only({ kg_admin_device: "D" });
    const f = mockFetch(200, { access_token: "A" });
    expect(await adminSignIn("boss@kg.kg", "pw")).toEqual({ ok: true });
    expect(body(f)).toEqual({ username: "boss@kg.kg", password: "pw", device_token: "D" });
  });

  it("adminSignIn: 401 → invalid, 429 → rate, сеть → network; cookie не ставятся", async () => {
    mockFetch(401, { code: "invalid_credentials" });
    expect(await adminSignIn("x@y.kg", "pw")).toEqual({ ok: false, error: "invalid" });
    mockFetch(429, { detail: "slow down" });
    expect(await adminSignIn("x@y.kg", "pw")).toEqual({ ok: false, error: "rate" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await adminSignIn("x@y.kg", "pw")).toEqual({ ok: false, error: "network" });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("adminSignIn: пустые email или пароль — в backend не ходит", async () => {
    const f = mockFetch(200, { access_token: "T" });
    expect(await adminSignIn("  ", "pw")).toEqual({ ok: false, error: "invalid" });
    expect(await adminSignIn("a@b.kg", "")).toEqual({ ok: false, error: "invalid" });
    expect(f).not.toHaveBeenCalled();
  });

  it("adminSignOut: logout в backend с refresh_token, удаляет сессию, но помнит доверенный браузер", async () => {
    only({ kg_admin: "A", kg_admin_refresh: "R", kg_admin_device: "D" });
    const f = mockFetch(200, {});
    await adminSignOut();
    expect(call(f)[0]).toMatch(/\/admin\/logout\/$/);
    expect(body(f)).toEqual({ refresh_token: "R" });
    expect(cookieStore.delete).toHaveBeenCalledWith("kg_admin");
    expect(cookieStore.delete).toHaveBeenCalledWith("kg_admin_refresh");
    expect(cookieStore.delete).not.toHaveBeenCalledWith("kg_admin_device");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("access истёк посреди работы: refresh → повтор запроса с новым токеном", async () => {
    only({ kg_admin: "OLD", kg_admin_refresh: "R" });
    const f = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(Response.json({ code: "session_expired" }, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ access_token: "NEW", expires_in: 3600 }))
      .mockResolvedValueOnce(Response.json({}, { status: 200 }));
    vi.stubGlobal("fetch", f);
    expect(await deleteRecord("tours", 5)).toEqual({ ok: true });
    expect(f.mock.calls[1][0]).toMatch(/\/admin\/token\/refresh\/$/);
    expect((f.mock.calls[2][1]?.headers as Record<string, string>).Authorization).toBe("Bearer NEW");
    expect(setCall("kg_admin")?.[1]).toBe("NEW");
  });
});

describe("сохранение и удаление", () => {
  it("saveRecord без cookie → auth, в backend не ходит", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const f = mockFetch(200, {});
    expect(await saveRecord("transports", 1, {}, {})).toMatchObject({ ok: false, error: "auth" });
    expect(f).not.toHaveBeenCalled();
  });

  it("saveRecord: PUT только изменённых полей и updateTag по тегам раздела", async () => {
    const f = mockFetch(200, { id: 1, title: "Новый" });
    const original = toFormValues(RESOURCES.helicopters, { id: 1, title: "Старый", price: "1000.00" });
    const res = await saveRecord("helicopters", 1, { ...original, title: "Новый" }, original);
    expect(res).toMatchObject({ ok: true, record: { id: 1, title: "Новый" } });
    const [url, init] = call(f);
    expect(url).toMatch(/\/helicopter-tours\/1\/$/);
    expect(init.method).toBe("PUT");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer T");
    expect(body(f)).toEqual({ title: "Новый" });
    expect(updateTag).toHaveBeenCalledWith("catalog");
  });

  it("saveRecord: ничего не изменилось — успех без запроса", async () => {
    const f = mockFetch(200, {});
    const original = toFormValues(RESOURCES.transports, { id: 1, name: "A", seats: 4, price: "10" });
    expect(await saveRecord("transports", 1, original, original)).toEqual({ ok: true });
    expect(f).not.toHaveBeenCalled();
  });

  it("saveRecord: новая запись — POST в раздел и все теги", async () => {
    const f = mockFetch(201, { id: 9 });
    const values = { ...toFormValues(RESOURCES.categories, null), name: "Горы" };
    expect(await saveRecord("categories", null, values, null)).toMatchObject({ ok: true });
    expect(call(f)[0]).toMatch(/\/tour-categories\/$/);
    expect(call(f)[1].method).toBe("POST");
    expect(updateTag).toHaveBeenCalledWith("tours");
    expect(updateTag).toHaveBeenCalledWith("catalog");
  });

  it("saveRecord: неверные поля → validation без запроса", async () => {
    const f = mockFetch(200, {});
    const values = { ...toFormValues(RESOURCES.transports, null), name: "" };
    expect(await saveRecord("transports", null, values, null)).toMatchObject({
      ok: false,
      error: "validation",
      fields: { name: "Обязательное поле" },
    });
    expect(f).not.toHaveBeenCalled();
  });

  it("saveRecord: 422 от backend → ошибки у полей", async () => {
    mockFetch(422, { detail: [{ loc: ["body", "price"], msg: "bad" }] });
    const values = { ...toFormValues(RESOURCES.transports, null), name: "A", seats: "4", price: "10" };
    expect(await saveRecord("transports", null, values, null)).toMatchObject({
      ok: false,
      error: "validation",
      fields: { price: "bad" },
    });
  });

  it("неизвестный раздел → backend-ошибка без запроса", async () => {
    const f = mockFetch(200, {});
    expect(await saveRecord("nope" as never, null, {}, null)).toMatchObject({ ok: false, error: "backend" });
    expect(f).not.toHaveBeenCalled();
  });

  it("истёкший токен: 401 → auth и cookie удалена", async () => {
    mockFetch(401, { detail: "expired" });
    expect(await deleteRecord("tours", 3)).toMatchObject({ ok: false, error: "auth" });
    expect(cookieStore.delete).toHaveBeenCalledWith("kg_admin");
  });

  it("backend не дал удалить → backend с его сообщением", async () => {
    mockFetch(400, { detail: "Tour has images" });
    expect(await deleteRecord("tours", 3)).toEqual({ ok: false, error: "backend", message: "Tour has images" });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("deleteRecord: DELETE по адресу записи и сброс кеша", async () => {
    const f = mockFetch(200, { ok: true });
    expect(await deleteRecord("tourImages", 4)).toEqual({ ok: true });
    expect(call(f)[0]).toMatch(/\/tour-images\/4\/$/);
    expect(call(f)[1].method).toBe("DELETE");
    expect(updateTag).toHaveBeenCalledWith("tours");
  });
});

describe("заявки и перевод", () => {
  it("сеть упала → network", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await setRequestStatus(5, "completed")).toMatchObject({ ok: false, error: "network" });
  });

  it("setRequestStatus: PATCH /admin/requests/5/status/", async () => {
    const f = mockFetch(200, { id: 5, status: "completed" });
    expect(await setRequestStatus(5, "completed")).toMatchObject({ ok: true });
    expect(call(f)[0]).toMatch(/\/admin\/requests\/5\/status\/$/);
    expect(call(f)[1].method).toBe("PATCH");
    expect(body(f)).toEqual({ status: "completed" });
  });

  it("setRequestStatus: чужой статус не отправляется", async () => {
    const f = mockFetch(200, {});
    expect(await setRequestStatus(5, "deleted" as never)).toMatchObject({ ok: false, error: "validation" });
    expect(f).not.toHaveBeenCalled();
  });

  it("retranslateTour: POST /tours/7/translate/ и сброс кеша туров", async () => {
    const f = mockFetch(200, {});
    expect(await retranslateTour(7)).toEqual({ ok: true });
    expect(call(f)[0]).toMatch(/\/tours\/7\/translate\/$/);
    expect(updateTag).toHaveBeenCalledWith("tours");
  });
});
