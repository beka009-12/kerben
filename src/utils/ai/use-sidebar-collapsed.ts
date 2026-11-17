"use client";

import { useSyncExternalStore } from "react";

const KEY = "kerben-ai-sidebar-collapsed";
const listeners = new Set<() => void>();
/** Значение в памяти — на случай, если localStorage недоступен (приватный режим) */
let memory: boolean | null = null;

function read(): boolean {
  if (memory !== null) return memory;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  // Переключили в другой вкладке — берём значение из хранилища, а не из памяти
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    memory = null;
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Свёрнута ли история чата на десктопе; выбор запоминается в браузере */
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);

  const toggle = () => {
    memory = !collapsed;
    try {
      window.localStorage.setItem(KEY, memory ? "1" : "0");
    } catch {
    }
    listeners.forEach((listener) => listener());
  };

  return { collapsed, toggle };
}
