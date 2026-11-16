import { describe, expect, it } from "vitest";
import { janky, weakDevice } from "@/utils/ui/use-lite-mode";

describe("weakDevice", () => {
  it("turns lite on when the user saves data", () => {
    expect(weakDevice({ connection: { saveData: true } }, false)).toBe(true);
  });

  it("turns lite on for phones with few cores or little memory", () => {
    expect(weakDevice({ hardwareConcurrency: 2, deviceMemory: 8 }, true)).toBe(true);
    expect(weakDevice({ hardwareConcurrency: 8, deviceMemory: 2 }, true)).toBe(true);
  });

  it("keeps full mode on strong phones and on desktops", () => {
    expect(weakDevice({ hardwareConcurrency: 8, deviceMemory: 8 }, true)).toBe(false);
    expect(weakDevice({ hardwareConcurrency: 4, deviceMemory: 4 }, true)).toBe(false);
    expect(weakDevice({ hardwareConcurrency: 2, deviceMemory: 2 }, false)).toBe(false);
  });

  it("keeps full mode on iPhones, where Safari always reports 4 cores and no memory", () => {
    expect(weakDevice({ hardwareConcurrency: 4 }, true)).toBe(false);
  });
});

describe("janky", () => {
  const frames = (count: number, ms: number) => Array.from({ length: count }, () => ms);

  it("waits for enough scroll frames before deciding", () => {
    expect(janky(frames(40, 120))).toBe(false);
  });

  it("turns lite on when scrolling keeps dropping frames", () => {
    expect(janky([...frames(60, 16), ...frames(30, 70)])).toBe(true);
  });

  it("keeps full mode for smooth scrolling, a few hitches and 30 fps power saving", () => {
    expect(janky(frames(90, 16))).toBe(false);
    expect(janky([...frames(84, 16), ...frames(6, 90)])).toBe(false);
    expect(janky(frames(90, 34))).toBe(false);
  });
});
