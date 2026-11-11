"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Tone = "success" | "error";
export type Notify = (text: string, tone?: Tone) => void;

export const ToastContext = createContext<Notify | null>(null);

export function useAdminToastState() {
  const [toast, setToast] = useState<{ id: number; text: string; tone: Tone } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback<Notify>((text, tone = "success") => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), text, tone });
    timer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, notify };
}

export function useAdminToast(): Notify {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useAdminToast must be used inside <AdminToastProvider>");
  return notify;
}
