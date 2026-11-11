import { afterEach, describe, expect, it, vi } from "vitest";
import { forgetScroll, rememberScroll, takeScroll } from "@/utils/ui/scroll-memory";

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("возврат к месту в списке", () => {
  it("запоминает, где клиент нажал на карточку, и отдаёт это место один раз", () => {
    window.history.replaceState(null, "", "/ru/tours?theme=lakes");
    vi.spyOn(window, "scrollY", "get").mockReturnValue(2400);
    rememberScroll();
    expect(takeScroll("/ru/tours")).toBeNull();
    expect(takeScroll("/ru/tours?theme=lakes")).toBe(2400);
    expect(takeScroll("/ru/tours?theme=lakes")).toBeNull();
  });

  it("закрыл окно регистрации на списке — позиция забывается", () => {
    window.history.replaceState(null, "", "/ru/hotels");
    vi.spyOn(window, "scrollY", "get").mockReturnValue(900);
    rememberScroll();
    forgetScroll();
    expect(takeScroll("/ru/hotels")).toBeNull();
  });
});
