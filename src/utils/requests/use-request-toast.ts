"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useRequestUpdates, type RequestUpdate } from "./use-request-updates";

const SHOW_MS = 9000;

export function shortTitle(title: string, labels: string[], more: string): string {
  const parts = title.split(" · ").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  const label = labels.find((item) => parts[0].startsWith(`${item}: `));
  const first = label ? parts[0].slice(label.length + 2) : parts[0];
  return parts.length > 1 ? `${first} ${more.replace("{n}", String(parts.length - 1))}` : first;
}

export function useRequestToast() {
  const { locale, dict } = useI18n();
  const t = dict.requests;
  const [update, setUpdate] = useState<RequestUpdate | null>(null);
  const onUpdate = useCallback((next: RequestUpdate) => setUpdate(next), []);
  useRequestUpdates(onUpdate);

  useEffect(() => {
    if (!update) return;
    const timer = setTimeout(() => setUpdate(null), SHOW_MS);
    return () => clearTimeout(timer);
  }, [update]);

  const labels = [dict.tour.tripStepTour, dict.tour.tripStepHotel, dict.tour.tripStepCar, dict.nav.helicopter, dict.nav.trekking];
  const done = update?.status === "completed";
  const off = update?.status === "cancelled";

  return {
    locale,
    dict,
    t,
    update,
    name: update ? shortTitle(update.title, labels, t.toastMore) : "",
    done,
    off,
    className: done ? "request-toast request-toast-done" : off ? "request-toast request-toast-off" : "request-toast",
    icon: done ? ("check" as const) : off ? ("x" as const) : ("inbox" as const),
    close: () => setUpdate(null),
  };
}
