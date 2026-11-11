import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

import { getCompanyStats, loadCompanyStats } from "@/utils/api/about";
import { getTransports, loadListCached } from "@/utils/api/catalog";
import { getContacts, loadContacts } from "@/utils/api/contacts";
import { getTours, loadBackendTours } from "@/utils/api/tours";

function backendDown() {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
  vi.spyOn(console, "warn").mockImplementation(() => {});
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("сбой backend не кешируется", () => {
  it("loadListCached бросает, getTransports отдаёт пустой список", async () => {
    backendDown();
    await expect(loadListCached("/transports/?lang=ru")).rejects.toThrow();
    expect(await getTransports("ru")).toEqual([]);
  });

  it("loadBackendTours бросает, getTours отдаёт пустой список — без выдуманных туров", async () => {
    backendDown();
    await expect(loadBackendTours("ru")).rejects.toThrow();
    expect(await getTours("ru")).toEqual([]);
  });

  it("loadCompanyStats бросает, getCompanyStats отдаёт null", async () => {
    backendDown();
    await expect(loadCompanyStats()).rejects.toThrow();
    expect(await getCompanyStats()).toBeNull();
  });

  it("loadContacts бросает, getContacts — без выдуманных контактов", async () => {
    backendDown();
    await expect(loadContacts("ru")).rejects.toThrow();
    const contacts = await getContacts("ru");
    expect(contacts.phone).toBeNull();
    expect(contacts.whatsappHref).toBeNull();
    expect(contacts.email).toBeNull();
  });

  it("пустой список туров в backend — не ошибка: loadBackendTours отдаёт пустой список", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([])));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await loadBackendTours("ru")).toEqual([]);
  });
});
