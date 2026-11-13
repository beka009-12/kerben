"use client";

import { useId, useState } from "react";
import type { SiteContacts } from "@/utils/api/contacts";
import { useI18n } from "@/utils/i18n/I18nProvider";

/** Ссылка WhatsApp с готовым текстом сообщения */
export function whatsappWithText(href: string, text: string): string {
  try {
    const url = new URL(href);
    if (text) url.searchParams.set("text", text);
    return url.toString();
  } catch {
    return href;
  }
}

/** Форма «Контакты»: сообщение уходит менеджеру в WhatsApp или Telegram, сайт его не хранит */
export function useContactForm(contacts: Pick<SiteContacts, "whatsappHref" | "telegramHref">) {
  const { dict } = useI18n();
  const t = dict.contact;
  const uid = useId();
  const [name, setName] = useState("");
  const [dates, setDates] = useState("");
  const [people, setPeople] = useState("");
  const [interests, setInterests] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const details = [
    dates.trim() ? `${t.dates}: ${dates.trim()}` : "",
    people.trim() ? `${t.people}: ${people.trim()}` : "",
    interests.trim() ? `${t.interests}: ${interests.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const text = [message.trim(), details, name.trim() ? `— ${name.trim()}` : ""].filter(Boolean).join("\n\n");
  const whatsappHref = contacts.whatsappHref ? whatsappWithText(contacts.whatsappHref, text) : null;
  const telegramHref = contacts.telegramHref;

  /** В Telegram нельзя передать текст ссылкой — копируем его, чтобы вставить в чат */
  async function copyForTelegram() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
    }
  }

  const id = (field: string) => `${uid}-${field}`;

  return { t, name, setName, dates, setDates, people, setPeople, interests, setInterests, message, setMessage, whatsappHref, telegramHref, copyForTelegram, copied, id };
}
