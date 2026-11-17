import { describe, expect, it } from "vitest";
import { navSlotAt } from "@/utils/layout/use-nav-drag";

// Панель 504px: внутренняя ширина 500px, 5 вкладок по 100px, отступ слева 2px
const LEFT = 10;
const WIDTH = 504;
const COUNT = 5;

describe("navSlotAt", () => {
  it("puts the pill center under the finger", () => {
    expect(navSlotAt(LEFT + 2 + 250, LEFT, WIDTH, COUNT)).toEqual({ offset: 200, index: 2 });
  });

  it("clamps the pill to the left edge", () => {
    expect(navSlotAt(LEFT, LEFT, WIDTH, COUNT)).toEqual({ offset: 0, index: 0 });
    expect(navSlotAt(LEFT - 80, LEFT, WIDTH, COUNT)).toEqual({ offset: 0, index: 0 });
  });

  it("clamps the pill to the right edge", () => {
    expect(navSlotAt(LEFT + WIDTH, LEFT, WIDTH, COUNT)).toEqual({ offset: 400, index: 4 });
    expect(navSlotAt(LEFT + WIDTH + 80, LEFT, WIDTH, COUNT)).toEqual({ offset: 400, index: 4 });
  });

  it("switches tab at the slot boundary", () => {
    expect(navSlotAt(LEFT + 2 + 99, LEFT, WIDTH, COUNT).index).toBe(0);
    expect(navSlotAt(LEFT + 2 + 100, LEFT, WIDTH, COUNT).index).toBe(1);
  });
});
