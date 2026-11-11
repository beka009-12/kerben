"use client";

import { useAutoRefresh } from "@/utils/layout/use-auto-refresh";

export { AWAY_MS, REFRESH_EVERY_MS } from "@/utils/layout/use-auto-refresh";

export function AutoRefresh() {
  useAutoRefresh();
  return null;
}
