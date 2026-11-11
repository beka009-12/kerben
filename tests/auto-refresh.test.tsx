import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.hoisted(() => vi.fn());
let pathname = "/ru/tours";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }), usePathname: () => pathname }));

import { AutoRefresh, AWAY_MS, REFRESH_EVERY_MS } from "@/components/layout/auto-refresh/AutoRefresh";

let visibility: DocumentVisibilityState = "visible";

function setVisibility(next: DocumentVisibilityState) {
  visibility = next;
  document.dispatchEvent(new Event("visibilitychange"));
}

beforeEach(() => {
  vi.useFakeTimers();
  visibility = "visible";
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  refresh.mockClear();
});

describe("автообновление каталога", () => {
  it("обновляет по таймеру, пока вкладка открыта", () => {
    pathname = "/ru/tours";
    render(<AutoRefresh />);
    act(() => {
      vi.advanceTimersByTime(REFRESH_EVERY_MS - 30 * 1000);
    });
    expect(refresh).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(30 * 1000);
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("короткий уход с вкладки не перезагружает данные", () => {
    pathname = "/ru/tours";
    render(<AutoRefresh />);
    act(() => {
      setVisibility("hidden");
      vi.advanceTimersByTime(10 * 1000);
      setVisibility("visible");
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("после долгого отсутствия обновляет один раз", () => {
    pathname = "/ru/tours";
    render(<AutoRefresh />);
    act(() => {
      setVisibility("hidden");
      vi.advanceTimersByTime(AWAY_MS);
      setVisibility("visible");
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("в чате и админке не обновляет — там человек печатает", () => {
    for (const path of ["/ru/chat", "/ru/admin/tours"]) {
      pathname = path;
      render(<AutoRefresh />);
      act(() => {
        setVisibility("hidden");
        vi.advanceTimersByTime(REFRESH_EVERY_MS * 2);
        setVisibility("visible");
      });
      cleanup();
    }
    expect(refresh).not.toHaveBeenCalled();
  });
});
