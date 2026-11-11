"use client";

import { useEffect, useState } from "react";
import { managerMessage, telegramUrl, whatsappUrl, type ManagerContacts } from "@/utils/contact/manager";

/** Ссылки на менеджера: WhatsApp с готовым текстом про тур и ссылкой на страницу, Telegram — чат с менеджером */
export function useManagerContact({ contacts, title, template }: { contacts: ManagerContacts; title: string; template: string }) {
  const [message, setMessage] = useState(() => managerMessage(template, title, "").trim());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(managerMessage(template, title, `${window.location.origin}${window.location.pathname}`).trim());
  }, [template, title]);

  return {
    whatsappHref: contacts.whatsapp ? whatsappUrl(contacts.whatsapp, message) : null,
    telegramHref: contacts.telegram ? telegramUrl(contacts.telegram) : null,
  };
}
