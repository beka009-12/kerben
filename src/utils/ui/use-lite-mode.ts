"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const LITE_CLASS = "lite";
const MIN_FPS = 40;
const MEASURE_DELAY_MS = 1500;
const MEASURE_MS = 2000;

let lite: boolean | null = null;

interface DeviceHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export function weakDevice(nav: DeviceHints, touch: boolean): boolean {
  if (nav.connection?.saveData) return true;
  if (!touch) return false;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return cores <= 4 || memory <= 4;
}

function applyLite() {
  document.documentElement.classList.add(LITE_CLASS);
}

function measureFps(onDone: (fps: number) => void): () => void {
  let frames = 0;
  let start = 0;
  let raf = 0;
  const tick = (now: number) => {
    if (!start) start = now;
    frames++;
    if (now - start < MEASURE_MS) raf = requestAnimationFrame(tick);
    else onDone((frames * 1000) / (now - start));
  };
  const timer = window.setTimeout(() => {
    if (document.visibilityState === "visible") raf = requestAnimationFrame(tick);
  }, MEASURE_DELAY_MS);
  return () => {
    window.clearTimeout(timer);
    cancelAnimationFrame(raf);
  };
}

export function useLiteMode() {
  const pathname = usePathname();

  useEffect(() => {
    if (lite === true) {
      applyLite();
      return;
    }
    if (lite === false) return;
    const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    if (weakDevice(navigator as Navigator & DeviceHints, touch)) {
      lite = true;
      applyLite();
      return;
    }
    return measureFps((fps) => {
      lite = fps < MIN_FPS;
      if (lite) applyLite();
    });
  }, [pathname]);
}
