"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const LITE_CLASS = "lite";
const MIN_FPS = 40;
const MEASURE_DELAY_MS = 1500;
const MEASURE_MS = 2000;
/** Кадр дольше — заметный рывок. 30 fps режима энергосбережения iOS (33 мс) сюда не попадают */
const SLOW_FRAME_MS = 50;
const SCROLL_SAMPLE_FRAMES = 90;
const MAX_SLOW_SHARE = 0.2;
/** Столько без событий scroll — прокрутка закончилась, замер кадров на паузе */
const SCROLL_IDLE_MS = 150;

/** Защёлка: включённый lite не выключается до перезагрузки страницы */
let lite = false;
let hintsChecked = false;
let idleChecked = false;
let scrollChecked = false;
const scrollFrames: number[] = [];
const listeners = new Set<() => void>();

interface DeviceHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/**
 * Safari на любом iPhone отдаёт hardwareConcurrency = 4 (защита от фингерпринтинга), поэтому 4 ядра — не признак слабости.
 * deviceMemory есть только в Chromium и округляется вниз: телефон на 3 ГБ отдаёт 2.
 * Остальные слабые телефоны ловит замер кадров при прокрутке.
 */
export function weakDevice(nav: DeviceHints, touch: boolean): boolean {
  if (nav.connection?.saveData) return true;
  if (!touch) return false;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return cores <= 2 || memory <= 2;
}

/** Длительности кадров во время прокрутки: устойчиво много долгих кадров — устройство не тянет */
export function janky(frames: readonly number[]): boolean {
  if (frames.length < SCROLL_SAMPLE_FRAMES) return false;
  const slow = frames.filter((ms) => ms > SLOW_FRAME_MS).length;
  return slow / frames.length > MAX_SLOW_SHARE;
}

function enableLite() {
  document.documentElement.classList.add(LITE_CLASS);
  if (lite) return;
  lite = true;
  for (const listener of listeners) listener();
}

function isTouch(): boolean {
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}

/**
 * Лёгкий режим уже включён или устройство слабое по подсказкам браузера.
 * Работает и до эффекта useLiteMode: эффекты детей (например, видео на первом экране) идут раньше эффекта Providers.
 */
export function isLite(): boolean {
  if (!lite && !hintsChecked) {
    hintsChecked = true;
    if (weakDevice(navigator as Navigator & DeviceHints, isTouch())) enableLite();
  }
  return lite;
}

/** Подписка на включение lite после замера: тяжёлое (видео) можно остановить на ходу */
export function onLite(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
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

/**
 * Замер кадров только пока человек прокручивает: в покое даже слабый телефон держит 60 fps,
 * а тормоза видны именно на прокрутке. Первые MEASURE_DELAY_MS после загрузки страницы (гидратация) не считаются.
 */
function measureScroll(onDone: (frames: readonly number[]) => void): () => void {
  let raf = 0;
  let last = 0;
  let lastScroll = 0;
  let armed = false;

  const tick = (now: number) => {
    if (last) scrollFrames.push(now - last);
    last = now;
    if (scrollFrames.length >= SCROLL_SAMPLE_FRAMES) {
      raf = 0;
      stop();
      onDone(scrollFrames);
      return;
    }
    if (now - lastScroll > SCROLL_IDLE_MS) {
      raf = 0;
      last = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  const onScroll = () => {
    if (lite) {
      stop();
      return;
    }
    lastScroll = performance.now();
    if (armed && !raf) raf = requestAnimationFrame(tick);
  };
  const timer = window.setTimeout(() => {
    armed = true;
  }, MEASURE_DELAY_MS);
  window.addEventListener("scroll", onScroll, { passive: true });

  function stop() {
    window.clearTimeout(timer);
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
  }
  return stop;
}

export function useLiteMode() {
  const pathname = usePathname();

  useEffect(() => {
    if (isLite()) {
      enableLite();
      return;
    }
    const stops: (() => void)[] = [];
    if (!idleChecked) {
      stops.push(
        measureFps((fps) => {
          idleChecked = true;
          if (fps < MIN_FPS) enableLite();
        }),
      );
    }
    // Только телефоны и планшеты: на компьютере рывки при прокрутке чаще от dev-сборки, чем от слабого железа
    if (!scrollChecked && isTouch()) {
      stops.push(
        measureScroll((frames) => {
          scrollChecked = true;
          if (janky(frames)) enableLite();
        }),
      );
    }
    return () => {
      for (const stop of stops) stop();
    };
  }, [pathname]);
}
