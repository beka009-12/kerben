"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, type KeyboardEvent } from "react";
import type { IconName } from "@/components/ui/icon/Icon";
import { useActiveRequests } from "@/utils/hooks/useActiveRequests";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useFavorites } from "@/utils/store/favorites";

export type TripsTab = "requests" | "saved";
export const TABS: TripsTab[] = ["requests", "saved"];
export const TRIPS_TAB_ICONS: Record<TripsTab, IconName> = { requests: "ticket", saved: "heart" };

export function useTripsTabs() {
  const { dict } = useI18n();
  const t = dict.trips;
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const uid = useId();
  const tab: TripsTab = params.get("tab") === "saved" ? "saved" : "requests";
  const counts: Record<TripsTab, number> = {
    requests: useActiveRequests(),
    saved: useFavorites((state) => state.slugs.length),
  };

  function select(next: TripsTab) {
    if (next === tab) return;
    router.replace(next === "requests" ? pathname : `${pathname}?tab=${next}`, { scroll: false });
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const next = TABS[(TABS.indexOf(tab) + (event.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    select(next);
    document.getElementById(`${uid}-${next}`)?.focus();
  }

  return { t, uid, tab, counts, select, onKey };
}
