import { describe, expect, it } from "vitest";
import { weakDevice } from "@/utils/ui/use-lite-mode";

describe("weakDevice", () => {
  it("turns lite on when the user saves data", () => {
    expect(weakDevice({ connection: { saveData: true } }, false)).toBe(true);
  });

  it("turns lite on for phones with few cores or little memory", () => {
    expect(weakDevice({ hardwareConcurrency: 4, deviceMemory: 8 }, true)).toBe(true);
    expect(weakDevice({ hardwareConcurrency: 8, deviceMemory: 2 }, true)).toBe(true);
  });

  it("keeps full mode on strong phones and on desktops", () => {
    expect(weakDevice({ hardwareConcurrency: 8, deviceMemory: 8 }, true)).toBe(false);
    expect(weakDevice({ hardwareConcurrency: 4, deviceMemory: 4 }, false)).toBe(false);
  });
});
