"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatHttpError, chatApi, type BookingPreview } from "@/utils/ai/backend-chat";
import { BACKEND_REQUEST_PREFIX, selectionFromSlug, sendBackendRequest } from "@/utils/api/client-backend";
import { savePhone } from "@/utils/auth";
import { draftKey, type BookingContext, type BookingDraft } from "@/utils/booking-chat";
import { localeNames } from "@/utils/i18n/config";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { describeSlug, saveRequest } from "@/utils/requests";
import { isValid, todayISO, validateBooking, type BookingInput } from "@/utils/validation";
import { useAuth } from "@/utils/store/auth";
import { useCarousel } from "@/utils/ui/use-carousel";
import { markSent, readSent } from "@/utils/booking-sent";
import type { IconName } from "@/components/ui/icon/Icon";
import { formatPrice } from "@/utils/format";
import { pickedList, useChatTrip, type PickKind } from "@/utils/trip/trip-store";

export interface BookingItem {
  key: string;
  kind: string;
  icon: IconName;
  title: string;
  image: string | null;
  price: string;
  href: string | null;
}

export const SENT_REDIRECT_MS = 2000;

/** Сводка заявки от backend-чата: кнопка подтверждает именно эту ревизию */
export interface BackendConfirm {
  preview: BookingPreview;
  requestId: string;
  onUpdate: (preview: BookingPreview) => void;
}

const SERVICE_KINDS: Record<string, PickKind> = { tour: "tour", hotel: "hotel", transport: "car", helicopter: "helicopter", trekking: "trekking" };

/** Сводка backend → черновик карточки (те же поля, что показывает карточка) */
export function previewDraft(preview: BookingPreview): BookingDraft {
  const data = preview.data ?? {};
  const services = (data.selected_services ?? []).map((s) => s.name).filter(Boolean);
  return {
    title: data.destination || services.join(", "),
    name: data.client_name ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    date: data.travel_date ?? "",
    endDate: "",
    guests: data.people_count ?? null,
    message: "",
  };
}

const KIND_ICONS: Record<PickKind, IconName> = { tour: "route", hotel: "bed", car: "car", helicopter: "helicopter", trekking: "backpack" };

export function useAiBookingCard({ draft, context, confirm }: { draft: BookingDraft; context: BookingContext | null; confirm?: BackendConfirm }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const t = dict.ai.booking;
  const key = draftKey(draft);
  const [sentId, setSentId] = useState(() => readSent()[key] ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(() => (sentId ? "sent" : "idle"));
  const [justSent, setJustSent] = useState(false);
  const saving = useRef<Promise<unknown>>(Promise.resolve());
  const [sentItems, setSentItems] = useState<BookingItem[] | null>(null);

  useEffect(() => {
    if (!justSent) return;
    const timer = setTimeout(() => void saving.current.finally(() => router.push(`/${locale}/trips`)), SENT_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [justSent, router, locale]);

  const slug = context?.slug ?? "ai-chat";
  const title = context?.title || draft.title || t.label;
  const user = useAuth((state) => state.user);
  const payload: BookingInput = {
    name: draft.name || user?.name || "",
    phone: draft.phone || user?.phone || "",
    email: draft.email || user?.email || undefined,
    date: draft.date || undefined,
    endDate: draft.endDate || undefined,
    guests: draft.guests ?? undefined,
    message: draft.message || undefined,
    tour: slug,
  };
  const errors = validateBooking(payload, todayISO());
  const valid = confirm ? confirm.preview.can_confirm : isValid(errors);

  const dateFormat = new Intl.DateTimeFormat(localeNames[locale].intl, { day: "numeric", month: "long", year: "numeric" });
  const at = (iso: string) => new Date(`${iso}T00:00`);
  const dates = draft.date
    ? draft.endDate && draft.endDate !== draft.date
      ? dateFormat.formatRange(at(draft.date), at(draft.endDate))
      : dateFormat.format(at(draft.date))
    : "";

  const picks = useChatTrip((state) => state.picks);
  const kinds: Record<PickKind, string> = {
    tour: dict.tour.tripStepTour,
    hotel: dict.tour.tripStepHotel,
    car: dict.tour.tripStepCar,
    helicopter: dict.nav.helicopter,
    trekking: dict.nav.trekking,
  };
  const mentioned = `${draft.title} ${draft.message}`.toLocaleLowerCase();
  const priceText = (price: number, unit: string | null) => (price > 0 ? `${formatPrice(price, locale)}${unit ? ` / ${unit}` : ""}` : "");
  const fromTrip: BookingItem[] = pickedList(picks)
    .filter((pick) => mentioned.includes(pick.title.toLocaleLowerCase()))
    .map((pick) => ({
      key: pick.key,
      kind: kinds[pick.kind],
      icon: KIND_ICONS[pick.kind],
      title: pick.title,
      image: pick.image,
      price: priceText(pick.price, pick.unit),
      href: pick.href,
    }));
  const fromBackend: BookingItem[] = (confirm?.preview.data.selected_services ?? []).map((service) => {
    const kind = SERVICE_KINDS[service.kind] ?? "tour";
    return { key: `${service.kind}-${service.id}`, kind: kinds[kind], icon: KIND_ICONS[kind], title: service.name, image: null, price: "", href: null };
  });
  const current: BookingItem[] =
    fromTrip.length > 0
      ? fromTrip
      : fromBackend.length > 0
        ? fromBackend
      : context?.image
        ? [{ key: context.slug, kind: t.label, icon: "ticket", title, image: context.image, price: priceText(context.price, context.unit), href: null }]
        : [];

  const items = sentItems ?? current;

  const details: { icon: IconName; label: string; value: string; wide?: boolean }[] = [
    ...(items.length === 0 ? [{ icon: "ticket" as IconName, label: t.item, value: title }] : []),
    { icon: "calendar" as IconName, label: t.date, value: dates, wide: Boolean(draft.endDate) },
    { icon: "users" as IconName, label: t.guests, value: draft.guests ? String(draft.guests) : "" },
    { icon: "user" as IconName, label: t.name, value: payload.name },
    { icon: "phone" as IconName, label: t.phone, value: payload.phone },
  ]
    .filter((row) => row.value)
    .map((row, i, rows) => {
      const half = rows.slice(0, i + 1).filter((r) => !r.wide).length;
      const last = i === rows.length - 1;
      return last && !row.wide && half % 2 === 1 ? { ...row, wide: true } : row;
    });
  const wish = draft.message;

  /** Подтверждение в backend-чате: только по кнопке и с ревизией показанной сводки */
  async function confirmBackend(confirm: BackendConfirm): Promise<{ id: string }> {
    try {
      const res = await chatApi<{ request_id: number | string }>("booking/confirm", {
        method: "POST",
        body: { session_id: confirm.preview.session_id, revision: confirm.preview.revision, confirmed: true },
      });
      return { id: String(res.request_id) };
    } catch (error) {
      // Данные изменились — показываем свежую сводку, старую ревизию повторно не отправляем
      const detail = error instanceof ChatHttpError ? (error.detail as { detail?: { booking_preview?: BookingPreview } } | null)?.detail : null;
      if (detail?.booking_preview) confirm.onUpdate(detail.booking_preview);
      throw error;
    }
  }

  /** Заявка в backend: подборка (тур, отель или машина из backend, иначе пустая) + даты, люди, телефон и состав поездки */
  async function sendToBackend(): Promise<{ id: string }> {
    const lines = items.map((item) => [item.kind, item.title, item.price].filter(Boolean).join(": "));
    const message = [
      lines.length > 0 ? lines.join("\n") : title,
      payload.endDate ? `${payload.date} — ${payload.endDate}` : "",
      payload.message?.trim() ?? "",
    ]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 2000);
    const id = await sendBackendRequest(selectionFromSlug(slug) ?? {}, {
      travel_date: payload.date ?? todayISO(),
      travelers_count: payload.guests ?? 1,
      phone: payload.phone,
      message,
    });
    return { id: `${BACKEND_REQUEST_PREFIX}${id}` };
  }

  async function send() {
    setStatus("sending");
    try {
      const res = confirm ? await confirmBackend(confirm) : await sendToBackend();
      markSent(key, res.id);
      if (user && payload.phone !== user.phone) savePhone(payload.phone);
      setSentId(res.id);
      setStatus("sent");
      setSentItems(items);
      useChatTrip.getState().clear();
      setJustSent(true);
      saving.current = saveRequest({
        ...describeSlug(slug),
        title,
        image: context?.image ?? null,
        price: context && context.price > 0 ? context.price : null,
        unit: context?.unit ?? null,
        backendId: res.id,
        contactName: payload.name,
        contactPhone: payload.phone,
        details: {
          items: items.map((item) => ({ icon: item.icon, label: item.kind, title: item.title, image: item.image, price: item.price })),
          date: draft.date,
          endDate: draft.endDate,
          guests: draft.guests,
          message: draft.message,
        },
      }).catch(() => {});
    } catch {
      setStatus("error");
    }
  }

  const strip = useCarousel<HTMLUListElement>(items.length, { wheel: true });

  // Заявка могла уйти словами в чате — тогда номер приходит из websocket
  const doneId = sentId || confirm?.requestId || "";

  return { locale, dict, t, sentId: doneId, status, sent: status === "sent" || doneId !== "", valid, items, details, wish, send, strip, scrollable: !(strip.atStart && strip.atEnd) };
}
