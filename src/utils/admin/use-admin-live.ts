"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Как часто админка перечитывает данные, пока вкладка открыта */
const POLL_MS = 15_000;

const editing = () => {
  const el = document.activeElement;
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el as HTMLElement | null)?.isContentEditable === true;
};

/** Админка видит новые заявки без перезагрузки: сверка с backend раз в 15 секунд и при возврате на вкладку */
export function useAdminLive() {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!editing()) router.refresh();
      }, 300);
    };
    const poll = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);
}
