import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const KEY = "kerben-ai-sidebar-collapsed";

async function loadHook() {
  const { useSidebarCollapsed } = await import("@/utils/ai/use-sidebar-collapsed");
  return useSidebarCollapsed;
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("свёрнутая история чата", () => {
  it("после ухода с чата берёт выбор другой вкладки из хранилища", async () => {
    const useSidebarCollapsed = await loadHook();
    const first = renderHook(() => useSidebarCollapsed());
    act(() => first.result.current.toggle());
    expect(first.result.current.collapsed).toBe(true);
    first.unmount();

    // Другая вкладка развернула историю, пока этот чат был размонтирован и storage никто не слушал
    localStorage.setItem(KEY, "0");

    const again = renderHook(() => useSidebarCollapsed());
    expect(again.result.current.collapsed).toBe(false);
    again.unmount();
  });

  it("без localStorage помнит выбор в памяти", async () => {
    const useSidebarCollapsed = await loadHook();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const { result, unmount } = renderHook(() => useSidebarCollapsed());
    act(() => result.current.toggle());
    expect(result.current.collapsed).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.collapsed).toBe(false);
    unmount();
  });
});
