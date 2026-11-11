"use client";

import { useEffect } from "react";
import { cancelledByMe, loadRequests, REQUESTS_CHANGED, type RequestStatus } from "@/utils/requests";
import { useAuth } from "@/utils/store/auth";

export interface RequestUpdate {
  id: string;
  title: string;
  status: RequestStatus;
}

/** Как часто сверять статусы заявок с backend, пока вкладка открыта */
export const REQUEST_POLL_MS = 30_000;

export function useRequestUpdates(onUpdate: (update: RequestUpdate) => void) {
  const userId = useAuth((state) => (state.status === "user" ? (state.user?.id ?? null) : null));

  useEffect(() => {
    if (!userId) return;
    let stopped = false;
    let known: Map<string, RequestStatus> | null = null;

    const check = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { items } = await loadRequests();
        if (stopped) return;
        const previous = known;
        known = new Map(items.map((item) => [item.id, item.status]));
        if (!previous) return;
        for (const item of items) {
          const old = previous.get(item.id);
          if (!old || old === item.status) continue;
          const update = { id: item.id, title: item.title, status: item.status };
          window.dispatchEvent(new CustomEvent<RequestUpdate>(REQUESTS_CHANGED, { detail: update }));
          if (update.status === "cancelled" && cancelledByMe.delete(update.id)) continue;
          onUpdate(update);
        }
      } catch {
      }
    };

    void check();
    const timer = setInterval(() => void check(), REQUEST_POLL_MS);
    const onVisible = () => void check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, onUpdate]);
}
