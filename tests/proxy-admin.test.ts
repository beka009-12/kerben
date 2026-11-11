import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const req = (url: string, cookie?: string) => new NextRequest(url, { headers: cookie ? { cookie } : {} });
const rewrite = (res: Response | undefined) => res?.headers.get("x-middleware-rewrite") ?? null;
const run = (request: NextRequest) => proxy(request) as Response | undefined;
const location = (res: Response | undefined) => res?.headers.get("location") ?? null;

beforeEach(() => {
  process.env.ADMIN_HOSTS = "admin.localhost, kerben-travel-admin.vercel.app";
});
afterEach(() => {
  delete process.env.ADMIN_HOSTS;
  vi.unstubAllGlobals();
});

describe("два адреса: клиентский и админский", () => {
  it("клиентский адрес: /ru/admin — всегда обычная 404, даже с cookie", () => {
    expect(rewrite(run(req("http://kerben-travel.vercel.app/ru/admin")))).toMatch(/\/ru\/__missing$/);
    expect(rewrite(run(req("http://kerben-travel.vercel.app/ru/admin/tours", "kg_admin=T")))).toMatch(/\/ru\/__missing$/);
  });

  it("клиентский адрес: остальное как раньше", () => {
    expect(run(req("http://kerben-travel.vercel.app/ru/tours"))).toBeUndefined();
    expect(location(run(req("http://kerben-travel.vercel.app/tours")))).toMatch(/\/[a-z]{2}\/tours$/);
  });

  it("адрес админа: корень → вход, если нет cookie; в админку, если есть", () => {
    expect(location(run(req("http://kerben-travel-admin.vercel.app/")))).toMatch(/\/ru\/admin\/login$/);
    expect(location(run(req("http://kerben-travel-admin.vercel.app/", "kg_admin=T")))).toMatch(/\/ru\/admin$/);
  });

  it("адрес админа: разделы без cookie → вход, страница входа открыта", () => {
    expect(location(run(req("http://admin.localhost:3002/ru/admin/tours")))).toMatch(/\/ru\/admin\/login$/);
    expect(run(req("http://admin.localhost:3002/ru/admin/login"))).toBeUndefined();
    expect(run(req("http://admin.localhost:3002/ru/admin/tours", "kg_admin=T"))).toBeUndefined();
  });

  it("адрес админа: клиентские страницы не показываем — 404", () => {
    expect(rewrite(run(req("http://admin.localhost:3002/ru/tours", "kg_admin=T")))).toMatch(/\/ru\/__missing$/);
  });

  it("с cookie на странице входа — сразу в админку", () => {
    expect(location(run(req("http://admin.localhost:3002/ru/admin/login", "kg_admin=T")))).toMatch(/\/ru\/admin$/);
  });

  it("токен не подошёл (?expired) — cookie удаляется и открывается вход, без петли вход ↔ админка", () => {
    const res = run(req("http://admin.localhost:3002/ru/admin/login?expired=1", "kg_admin=T"));
    expect(location(res)).toBeNull();
    expect(res?.headers.get("set-cookie")).toMatch(/kg_admin=;.*Expires=Thu, 01 Jan 1970/i);
  });

  it("адрес берётся из заголовка Host (dev-сервер подставляет в URL свой hostname)", () => {
    const request = new NextRequest("http://localhost:3002/", { headers: { host: "admin.localhost:3002" } });
    expect(location(run(request))).toMatch(/\/ru\/admin\/login$/);
  });

  it("адрес админки узнаётся по имени и без ADMIN_HOSTS: *-admin.* и admin.*", () => {
    delete process.env.ADMIN_HOSTS;
    expect(location(run(req("https://kerben-travel-admin.vercel.app/")))).toMatch(/\/ru\/admin\/login$/);
    expect(location(run(req("https://admin.kerbentravel.kg/")))).toMatch(/\/ru\/admin\/login$/);
    expect(location(run(req("https://tours-app-teal.vercel.app/")))).toMatch(/\/[a-z]{2}$/);
    expect(location(run(req("https://administration-tours.vercel.app/")))).toMatch(/\/[a-z]{2}$/);
  });
});

describe("продление сессии админа", () => {
  it("access истёк, refresh есть → новый access из backend, страница открывается", async () => {
    const fetchMock = vi.fn(async () => Response.json({ access_token: "NEW", expires_in: 3600, refresh_token: "R2", refresh_expires_at: "2099-01-01T00:00:00Z" }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await proxy(req("http://admin.localhost:3002/ru/admin/tours", "kg_admin_refresh=R1"));
    expect(location(res)).toBeNull();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/admin\/token\/refresh\/$/);
    expect(JSON.parse(String(init.body))).toEqual({ refresh_token: "R1" });
    const cookies = res?.headers.get("set-cookie") ?? "";
    expect(cookies).toMatch(/kg_admin=NEW;.*Max-Age=3600/i);
    expect(cookies).toMatch(/kg_admin_refresh=R2/);
    expect(res?.headers.get("x-middleware-request-cookie") ?? res?.headers.get("x-middleware-override-headers") ?? "").not.toBe("");
  });

  it("refresh не принят → вход с ?expired, без петли", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ code: "session_expired" }, { status: 401 })));
    const res = await proxy(req("http://admin.localhost:3002/ru/admin/tours", "kg_admin_refresh=OLD"));
    expect(location(res)).toMatch(/\/ru\/admin\/login\?expired=1$/);
  });

  it("на странице входа с одним refresh — в админку, cookie чистятся при ?expired", () => {
    expect(location(run(req("http://admin.localhost:3002/ru/admin/login", "kg_admin_refresh=R")))).toMatch(/\/ru\/admin$/);
    const res = run(req("http://admin.localhost:3002/ru/admin/login?expired=1", "kg_admin_refresh=R"));
    expect(res?.headers.get("set-cookie")).toMatch(/kg_admin_refresh=;/);
  });
});
