"use client";

import { ChatHttpError, chatApi } from "@/utils/ai/backend-chat";

/**
 * Отзывы и заявки клиента в backend (новый API). Запросы идут через прокси /api/chat/…,
 * токен клиента backend берётся так же, как для ИИ-чата.
 */

export interface BackendReview {
  id: number;
  display_name: string;
  rating: number;
  text: string;
  created_at: string;
}

/** Тур из backend — у него slug это его id (число); у демо-туров slug словами */
export const backendTourId = (slug: string): number | null => (/^\d{1,9}$/.test(slug) ? Number(slug) : null);

export async function loadBackendReviews(tourId: number): Promise<BackendReview[]> {
  const response = await fetch(`/api/chat/tours/${tourId}/reviews`, { cache: "no-store" });
  if (!response.ok) throw new ChatHttpError(response.status, await response.json().catch(() => null));
  const data = (await response.json()) as unknown;
  return Array.isArray(data) ? (data as BackendReview[]) : [];
}

export const createBackendReview = (tourId: number, rating: number, text: string) =>
  chatApi<BackendReview>(`tours/${tourId}/reviews`, { method: "POST", body: { rating, text } });

export const deleteBackendReview = (tourId: number, reviewId: number) => chatApi<unknown>(`tours/${tourId}/reviews/${reviewId}`, { method: "DELETE" });

/** Свои отзывы backend не помечает — запоминаем id своих отзывов в этом браузере */
const MY_REVIEWS_KEY = "kerben-my-reviews";

export function myReviewIds(userId: string): number[] {
  try {
    const all = JSON.parse(window.localStorage.getItem(MY_REVIEWS_KEY) ?? "{}") as Record<string, number[]>;
    return Array.isArray(all[userId]) ? all[userId] : [];
  } catch {
    return [];
  }
}

export function rememberMyReview(userId: string, reviewId: number, keep: boolean) {
  try {
    const all = JSON.parse(window.localStorage.getItem(MY_REVIEWS_KEY) ?? "{}") as Record<string, number[]>;
    const ids = new Set(Array.isArray(all[userId]) ? all[userId] : []);
    if (keep) ids.add(reviewId);
    else ids.delete(reviewId);
    all[userId] = [...ids];
    window.localStorage.setItem(MY_REVIEWS_KEY, JSON.stringify(all));
  } catch {
  }
}

export interface BackendSelection {
  tour_id?: number;
  hotel_id?: number;
  transport_id?: number;
}

/** Что бронируют, по slug карточки: «12» — тур, «hotel-5» — отель, «transport-7» — машина */
export function selectionFromSlug(slug: string): BackendSelection | null {
  const tour = backendTourId(slug);
  if (tour) return { tour_id: tour };
  const match = /^(hotel|transport)-(\d{1,9})$/.exec(slug);
  if (!match) return null;
  return match[1] === "hotel" ? { hotel_id: Number(match[2]) } : { transport_id: Number(match[2]) };
}

const idOf = (data: unknown, keys: string[]): number | null => {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isInteger(value) && value > 0) return value;
  }
  return null;
};

export interface BackendRequestInput {
  travel_date: string;
  travelers_count: number;
  phone: string;
  message: string | null;
}

/** Заявка в backend: сначала подборка (что выбрано), потом сама заявка с датой, людьми и телефоном */
export async function sendBackendRequest(selection: BackendSelection, input: BackendRequestInput): Promise<number> {
  const created = await chatApi<unknown>("travel-selections", { method: "POST", body: selection });
  const selectionId = idOf(created, ["id", "selection_id"]);
  if (!selectionId) throw new ChatHttpError(502, { detail: "no selection id" });
  const request = await chatApi<unknown>("travel-requests", { method: "POST", body: { selection_id: selectionId, ...input } });
  const requestId = idOf(request, ["id", "request_id"]);
  if (!requestId) throw new ChatHttpError(502, { detail: "no request id" });
  return requestId;
}

/** Заявки backend в списке «Мои поездки» помечаются так, чтобы отличать их от заявок из почтового ящика сайта */
export const BACKEND_REQUEST_PREFIX = "kg-";

export const cancelBackendRequest = (requestId: number) => chatApi<unknown>(`travel-requests/me/${requestId}`, { method: "DELETE" });
