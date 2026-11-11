import { beforeEach, describe, expect, it } from "vitest";
import { migrateStorageKeys } from "@/utils/storage-keys";

beforeEach(() => localStorage.clear());

describe("переименование KyrgyzGo → Kerben Travel", () => {
  it("данные под старыми ключами переезжают под новые, старые ключи удаляются", () => {
    localStorage.setItem("kyrgyzgo-requests", "[1]");
    localStorage.setItem("kyrgyzgo-trip", '{"state":{}}');
    migrateStorageKeys();
    expect(localStorage.getItem("kerben-requests")).toBe("[1]");
    expect(localStorage.getItem("kerben-trip")).toBe('{"state":{}}');
    expect(localStorage.getItem("kyrgyzgo-requests")).toBeNull();
    expect(localStorage.getItem("kyrgyzgo-trip")).toBeNull();
  });

  it("старая сессия Supabase удаляется", () => {
    localStorage.setItem("sb-abc-auth-token", "{}");
    localStorage.setItem("tours-favorites", "{}");
    migrateStorageKeys();
    expect(localStorage.getItem("sb-abc-auth-token")).toBeNull();
    expect(localStorage.getItem("tours-favorites")).toBe("{}");
  });

  it("новые данные не затираются старыми", () => {
    localStorage.setItem("kyrgyzgo-requests", "[1]");
    localStorage.setItem("kerben-requests", "[2]");
    migrateStorageKeys();
    expect(localStorage.getItem("kerben-requests")).toBe("[2]");
  });
});
