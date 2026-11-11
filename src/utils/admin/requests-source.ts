import "server-only";
import { cache } from "react";
import { AdminAuthError, adminFetch } from "./api";
import type { TravelRequest } from "./resources";

/** Один запрос заявок на показ страницы: меню (счётчик) и обзор берут один и тот же ответ */
export const loadAllRequests = cache(async function loadAllRequests(token: string): Promise<TravelRequest[] | null> {
  const backend = await adminFetch<TravelRequest[]>(token, "/admin/requests/").catch((error: unknown) => {
    if (error instanceof AdminAuthError) throw error;
    return null;
  });
  return Array.isArray(backend) ? backend : null;
});
