"use client";

import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { ChatHttpError } from "@/utils/ai/backend-chat";
import {
  backendTourId,
  createBackendReview,
  deleteBackendReview,
  loadBackendReviews,
  myReviewIds,
  rememberMyReview,
  type BackendReview,
} from "@/utils/api/client-backend";
import { localeNames } from "@/utils/i18n/config";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useAuth } from "@/utils/store/auth";

interface Review {
  id: number;
  user_id: string;
  rating: number;
  body: string;
  created_at: string;
  profiles: { name: string } | null;
}

const MIN_LENGTH = 10;
export const REVIEW_MAX_LENGTH = 1000;
/** Сколько отзывов видно сразу, остальные — по кнопке «Показать все» */
const PAGE = 10;

export type ReviewFilter = "all" | "good" | "bad";
/** Хорошие — 4–5 звёзд, плохие — 1–3 */
const MATCH: Record<ReviewFilter, (rating: number) => boolean> = {
  all: () => true,
  good: (rating) => rating >= 4,
  bad: (rating) => rating <= 3,
};
export const REVIEW_FILTERS = Object.keys(MATCH) as ReviewFilter[];

const fromBackend = (review: BackendReview): Review => ({
  id: review.id,
  user_id: "",
  rating: review.rating,
  body: review.text,
  created_at: review.created_at,
  profiles: { name: review.display_name },
});

/** Отзывы туров живут в backend; у демо-туров (без id в backend) отзывов нет */
export function useTourReviews({ tourSlug }: { tourSlug: string }) {
  const backendId = backendTourId(tourSlug);
  const { locale, dict } = useI18n();
  const t = dict.reviews;
  const uid = useId();
  const { status, user } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [expanded, setExpanded] = useState(false);

  const [mineIds, setMineIds] = useState<number[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMineIds(user && backendId ? myReviewIds(user.id) : []);
  }, [user, backendId]);

  const load = useCallback(async () => {
    if (backendId) {
      try {
        const list = await loadBackendReviews(backendId);
        setLoadError(false);
        setReviews(list.map(fromBackend).sort((a, b) => b.created_at.localeCompare(a.created_at)));
      } catch {
        setLoadError(true);
      }
      return;
    }
    setLoadError(false);
    setReviews([]);
  }, [backendId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const list = useMemo(() => reviews ?? [], [reviews]);
  const count = list.length;
  const average = count ? list.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const mine = user ? list.find((r) => (backendId ? mineIds.includes(r.id) : r.user_id === user.id)) : undefined;
  const counts = useMemo(
    () => Object.fromEntries(REVIEW_FILTERS.map((key) => [key, list.filter((r) => MATCH[key](r.rating)).length])) as Record<ReviewFilter, number>,
    [list],
  );
  const filtered = useMemo(() => list.filter((r) => MATCH[filter](r.rating)), [list, filter]);
  const shown = expanded ? filtered : filtered.slice(0, PAGE);
  const hiddenCount = filtered.length - shown.length;
  const choose = (next: ReviewFilter) => {
    setFilter(next);
    setExpanded(false);
  };
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(localeNames[locale].intl, { day: "numeric", month: "long", year: "numeric" }), [locale]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!rating) return setFormError(t.errorRating);
    if (body.trim().length < MIN_LENGTH) return setFormError(t.errorShort);
    setFormError("");
    setSending(true);
    if (backendId) {
      try {
        const created = await createBackendReview(backendId, rating, body.trim());
        if (user && created?.id) {
          rememberMyReview(user.id, created.id, true);
          setMineIds(myReviewIds(user.id));
        }
        setRating(0);
        setBody("");
        await load();
      } catch (error) {
        setFormError(error instanceof ChatHttpError && (error.status === 400 || error.status === 409) ? t.already : t.error);
      } finally {
        setSending(false);
      }
      return;
    }
    setSending(false);
    setFormError(t.error);
  }

  async function remove(id: number) {
    if (!window.confirm(t.removeConfirm)) return;
    const previous = reviews;
    setReviews((prev) => prev?.filter((r) => r.id !== id) ?? prev);
    if (backendId) {
      try {
        await deleteBackendReview(backendId, id);
        if (user) {
          rememberMyReview(user.id, id, false);
          setMineIds(myReviewIds(user.id));
        }
      } catch {
        setReviews(previous);
        window.alert(t.error);
      }
      return;
    }
  }

  return {
    locale, dict, t, uid, status, user, reviews, loadError, rating, setRating, body, setBody, formError, sending, count, average, mine, dateFormat, submit, remove,
    filter, choose, counts, shown, hiddenCount, expanded, setExpanded, canCollapse: expanded && filtered.length > PAGE,
  };
}
