import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/ru" }));

type HeroVideoModule = typeof import("@/components/home/hero/HeroVideo");

let intersect: (visible: boolean) => void = () => {};

class FakeIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {
    intersect = (visible) => {
      act(() => {
        this.callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      });
    };
  }
  observe() {}
  disconnect() {}
}

const pausedState = new WeakMap<HTMLMediaElement, boolean>();
const play = vi.fn(function (this: HTMLMediaElement) {
  pausedState.set(this, false);
  this.dispatchEvent(new Event("play"));
  return Promise.resolve();
});
const pause = vi.fn(function (this: HTMLMediaElement) {
  pausedState.set(this, true);
  this.dispatchEvent(new Event("pause"));
});

function setDevice({ weak, touch = weak }: { weak: boolean; touch?: boolean }) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: touch && query === "(pointer: coarse)" }));
  Object.defineProperty(navigator, "deviceMemory", { value: weak ? 2 : 8, configurable: true });
  Object.defineProperty(navigator, "hardwareConcurrency", { value: weak ? 2 : 8, configurable: true });
}

async function renderVideo(): Promise<HTMLVideoElement> {
  vi.resetModules();
  const { HeroVideo }: HeroVideoModule = await import("@/components/home/hero/HeroVideo");
  const { container } = render(<HeroVideo pauseLabel="Pause" playLabel="Play" />);
  const video = container.querySelector("video");
  if (!video) throw new Error("no video");
  return video;
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  Object.defineProperty(HTMLMediaElement.prototype, "paused", {
    configurable: true,
    get(this: HTMLMediaElement) {
      return pausedState.get(this) ?? true;
    },
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  play.mockClear();
  pause.mockClear();
  document.documentElement.classList.remove("lite");
});

describe("HeroVideo", () => {
  it("does not download the clip before it plays", async () => {
    setDevice({ weak: false });
    const video = await renderVideo();
    expect(video.getAttribute("preload")).toBe("none");
  });

  it("plays only while the first screen is visible", async () => {
    setDevice({ weak: false });
    const video = await renderVideo();
    expect(play).not.toHaveBeenCalled();

    intersect(true);
    expect(video.paused).toBe(false);

    intersect(false);
    expect(video.paused).toBe(true);

    intersect(true);
    expect(video.paused).toBe(false);
  });

  it("keeps the clip paused after the visitor pauses it", async () => {
    setDevice({ weak: false });
    const video = await renderVideo();
    intersect(true);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(video.paused).toBe(true);

    intersect(false);
    intersect(true);
    expect(video.paused).toBe(true);
  });

  it("shows the poster on weak phones until the visitor presses play", async () => {
    setDevice({ weak: true });
    const video = await renderVideo();
    intersect(true);
    expect(play).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains("lite")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(video.paused).toBe(false);
  });
});

describe("HeroVideo with lite detection on a phone", () => {
  let clock = 0;
  let frames = new Map<number, FrameRequestCallback>();
  let nextId = 0;

  function frame(ms: number, scroll: boolean) {
    clock += ms;
    if (scroll) window.dispatchEvent(new Event("scroll"));
    const run = [...frames.values()];
    frames = new Map();
    act(() => {
      for (const callback of run) callback(clock);
    });
  }

  async function renderPage(): Promise<HTMLVideoElement> {
    vi.resetModules();
    const lite = await import("@/utils/ui/use-lite-mode");
    const { HeroVideo }: HeroVideoModule = await import("@/components/home/hero/HeroVideo");
    function Page() {
      lite.useLiteMode();
      return <HeroVideo pauseLabel="Pause" playLabel="Play" />;
    }
    const { container } = render(<Page />);
    const video = container.querySelector("video");
    if (!video) throw new Error("no video");
    intersect(true);
    // Гидратация позади, замер в покое: 60 fps — телефон не слабый
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    for (let i = 0; i < 130; i++) frame(16, false);
    return video;
  }

  beforeEach(() => {
    clock = 0;
    frames = new Map();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.spyOn(performance, "now").mockImplementation(() => clock);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.set(++nextId, callback);
      return nextId;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    setDevice({ weak: false, touch: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("switches to lite and stops the clip when scrolling keeps dropping frames", async () => {
    const video = await renderPage();
    expect(video.paused).toBe(false);
    expect(document.documentElement.classList.contains("lite")).toBe(false);

    for (let i = 0; i < 100; i++) frame(70, true);

    expect(document.documentElement.classList.contains("lite")).toBe(true);
    expect(video.paused).toBe(true);
  });

  it("stays in full mode while scrolling is smooth", async () => {
    const video = await renderPage();
    for (let i = 0; i < 100; i++) frame(16, true);

    expect(document.documentElement.classList.contains("lite")).toBe(false);
    expect(video.paused).toBe(false);
  });
});
