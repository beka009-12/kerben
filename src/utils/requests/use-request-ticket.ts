"use client";

import type { IconName } from "@/components/ui/icon/Icon";
import { formatPrice } from "@/utils/format";
import { localeNames } from "@/utils/i18n/config";
import { useI18n } from "@/utils/i18n/I18nProvider";
import type { MyRequest } from "@/utils/requests";
import { REQUEST_KIND_ICONS } from "./request-icons";

export function useRequestTicket(item: MyRequest) {
  const { locale, dict } = useI18n();
  const t = dict.requests;
  const details = item.details;
  const number = item.backendId ? (item.backendId.length > 12 ? item.backendId.slice(0, 8) : item.backendId) : null;

  const items =
    details && details.items.length > 0
      ? details.items
      : [
          {
            icon: REQUEST_KIND_ICONS[item.kind],
            label: t.kinds[item.kind],
            title: item.title,
            image: item.image,
            price: item.price ? `${formatPrice(item.price, locale)}${item.unit ? ` / ${item.unit}` : ""}` : "",
          },
        ];

  const day = (iso: string) =>
    new Intl.DateTimeFormat(localeNames[locale].intl, { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T00:00`));
  const dates = details?.date ? (details.endDate ? `${day(details.date)} — ${day(details.endDate)}` : day(details.date)) : "";
  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: "calendar" as IconName, label: t.ticket.dates, value: dates },
    { icon: "users" as IconName, label: t.ticket.guests, value: details?.guests ? String(details.guests) : "" },
    { icon: "user" as IconName, label: t.ticket.name, value: item.contactName ?? "" },
    { icon: "phone" as IconName, label: t.ticket.phone, value: item.contactPhone ?? "" },
  ].filter((fact) => fact.value);

  return { locale, dict, t, details, cancelled: item.status === "cancelled", items, facts, title: number ? `${t.number} ${number}` : t.ticket.label };
}
