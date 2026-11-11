"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import type { ManagerContacts } from "@/utils/contact/manager";
import { useManagerContact } from "@/utils/tour/use-manager-contact";
import "./tour-contact.css";

export interface TourContactLabels {
  from: string;
  perPerson: string;
  message: string;
  whatsapp: string;
  telegram: string;
  ask: string;
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Z" />
      <path
        fill="#25D366"
        d="M8.7 7.1c.3-.3.7-.3 1 0l1.2 1.7c.2.3.2.7 0 1l-.6.8c.6 1.3 1.7 2.4 3 3l.8-.6c.3-.2.7-.2 1 0l1.7 1.2c.3.3.3.7 0 1-1 .9-2.4 1.1-3.6.5a10.6 10.6 0 0 1-4.8-4.8c-.6-1.2-.4-2.7.5-3.6Z"
      />
    </svg>
  );
}

function TelegramMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M3.1 11.3 19.6 4.9c.8-.3 1.5.2 1.3 1.2l-2.8 13.3c-.2.9-.8 1.2-1.6.7l-4.4-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.6-.2L7 13.6l-4.4-1.4c-.9-.3-1-.9.5-1.4Z" />
    </svg>
  );
}

export function TourContact({
  title,
  price,
  otherPrices = [],
  ratesNote,
  contacts,
  askHref,
  labels,
}: {
  title: string;
  price: string;
  otherPrices?: string[];
  ratesNote?: string;
  contacts: ManagerContacts;
  askHref: string;
  labels: TourContactLabels;
}) {
  const { whatsappHref, telegramHref } = useManagerContact({ contacts, title, template: labels.message });

  const button = (compact: boolean, variant: string) => `tour-contact-button ${variant}${compact ? " tour-contact-button-compact" : ""}`;

  const buttons = (compact: boolean) => (
    <>
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={button(compact, "tour-contact-button-whatsapp")}
          aria-label={compact ? labels.whatsapp : undefined}
        >
          <WhatsAppMark />
          {!compact && labels.whatsapp}
        </a>
      )}
      {telegramHref && (
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className={button(compact, "tour-contact-button-telegram")}
          aria-label={compact ? labels.telegram : undefined}
        >
          <TelegramMark />
          {!compact && labels.telegram}
        </a>
      )}
      <Link href={askHref} className={button(compact, "tour-contact-button-ai")}>
        <Icon name="chat" size={18} />
        {labels.ask}
      </Link>
    </>
  );

  return (
    <>
      <div className="tour-contact-card">
        <p className="tour-contact-price">
          <span className="tour-contact-from">{labels.from}</span> {price}
        </p>
        <p className="tour-contact-per">{labels.perPerson}</p>
        {otherPrices.length > 0 && (
          <p className="tour-contact-other" title={ratesNote}>
            {otherPrices.map((item) => (
              <span key={item} className="tour-contact-other-item">
                ≈ {item}
              </span>
            ))}
          </p>
        )}
        <div className="tour-contact-actions">{buttons(false)}</div>
      </div>

      <div className="tour-contact-bar">
        <p className="tour-contact-bar-price">
          <span className="tour-contact-bar-amount">
            {labels.from} {price}
          </span>
          <span className="tour-contact-bar-per">{labels.perPerson}</span>
        </p>
        <div className="tour-contact-bar-actions">{buttons(true)}</div>
      </div>
    </>
  );
}
