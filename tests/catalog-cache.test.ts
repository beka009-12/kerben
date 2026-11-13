import { afterEach, describe, expect, it, vi } from "vitest";

const cacheLife = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ cacheLife, cacheTag: vi.fn() }));

import { getCompanyStats, loadCompanyStats } from "@/utils/api/about";
import { RETRY_SOON } from "@/utils/api/cache-fallback";
import { getTransports, loadListCached } from "@/utils/api/catalog";
import { getContacts, loadContacts } from "@/utils/api/contacts";
import { loadKgsRates } from "@/utils/api/rates";
import { getTours, loadBackendTours } from "@/utils/api/tours";

function backendDown() {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
  vi.spyOn(console, "warn").mockImplementation(() => {});
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  cacheLife.mockClear();
});

// Ошибка внутри "use cache" валит prerender и всю сборку (502/429 от backend при деплое),
// поэтому кешируемые загрузчики не бросают, а отдают пустое на 30 секунд (RETRY_SOON)
describe("сбой backend: пустой результат с коротким кешем, без ошибки", () => {
  it("loadListCached отдаёт пустой список, getTransports тоже", async () => {
    backendDown();
    await expect(loadListCached("/transports/?lang=ru")).resolves.toEqual([]);
    expect(cacheLife).toHaveBeenCalledWith(RETRY_SOON);
    expect(await getTransports("ru")).toEqual([]);
  });

  it("loadBackendTours отдаёт пустой список — без выдуманных туров", async () => {
    backendDown();
    await expect(loadBackendTours("ru")).resolves.toEqual([]);
    expect(cacheLife).toHaveBeenCalledWith(RETRY_SOON);
    expect(await getTours("ru")).toEqual([]);
  });

  it("loadCompanyStats отдаёт null — цифры по умолчанию", async () => {
    backendDown();
    await expect(loadCompanyStats()).resolves.toBeNull();
    expect(cacheLife).toHaveBeenCalledWith(RETRY_SOON);
    expect(await getCompanyStats()).toBeNull();
  });

  it("loadContacts — без выдуманных контактов", async () => {
    backendDown();
    const contacts = await loadContacts("ru");
    expect(cacheLife).toHaveBeenCalledWith(RETRY_SOON);
    expect(contacts.phone).toBeNull();
    expect(contacts.whatsappHref).toBeNull();
    expect(contacts.email).toBeNull();
    expect((await getContacts("ru")).phone).toBeNull();
  });

  it("курс НБКР недоступен — null с коротким кешем", async () => {
    backendDown();
    await expect(loadKgsRates()).resolves.toBeNull();
    expect(cacheLife).toHaveBeenCalledWith(RETRY_SOON);
  });

  it("закрытый раздел (401) — обычный кеш, это не сбой", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ detail: "no" }, { status: 401 })));
    await expect(loadListCached("/transports/?lang=ru")).resolves.toEqual([]);
    expect(cacheLife).not.toHaveBeenCalledWith(RETRY_SOON);
  });

  it("пустой список туров в backend — не ошибка и не короткий кеш", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([])));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await loadBackendTours("ru")).toEqual([]);
    expect(cacheLife).not.toHaveBeenCalledWith(RETRY_SOON);
  });

  it("профиль держит запись в prerender: revalidate 30 с, stale и expire не ниже 5 минут", () => {
    expect(RETRY_SOON.revalidate).toBe(30);
    expect(RETRY_SOON.stale).toBeGreaterThanOrEqual(300);
    expect(RETRY_SOON.expire).toBeGreaterThan(300);
  });
});
