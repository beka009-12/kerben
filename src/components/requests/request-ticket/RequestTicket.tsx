"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import type { MyRequest } from "@/utils/requests";
import { ticketIcon } from "@/utils/requests/request-icons";
import { useRequestTicket } from "@/utils/requests/use-request-ticket";
import "./request-ticket.css";

export function RequestTicket({ item, date, children }: { item: MyRequest; date: (iso: string) => string; children?: ReactNode }) {
  const { locale, t, details, cancelled, items, facts, title } = useRequestTicket(item);

  return (
    <article className={cancelled ? "ticket ticket-cancelled" : "ticket"} aria-label={title}>
      <header className="ticket-head">
        <span className="ticket-brand">
          <span className="ticket-brand-mark" aria-hidden="true">
            <Icon name="ticket" size={16} />
          </span>
          <span className="ticket-brand-text">
            <span className="ticket-brand-name">Kerben Travel</span>
            <span className="ticket-brand-label">{title}</span>
          </span>
        </span>
        <span className="ticket-head-side">
          <span className={`ticket-status ticket-status-${item.status}`}>{t.ticket.statuses[item.status]}</span>
          <span className="ticket-date">{date(item.createdAt)}</span>
        </span>
      </header>

      <div className="ticket-body">
        <p className="ticket-section">{t.ticket.items}</p>
        <ul className="ticket-items">
          {items.map((entry, i) => {
            const href = i === 0 && item.link && !details ? `/${locale}${item.link}` : null;
            return (
              <li key={`${entry.title}-${i}`} className="ticket-item">
                <span className="ticket-thumb">
                  {entry.image ? (
                    <Image src={entry.image} alt="" fill sizes="64px" className="ticket-thumb-image" />
                  ) : (
                    <Icon name={ticketIcon(entry.icon)} size={22} />
                  )}
                </span>
                <span className="ticket-item-text">
                  <span className="ticket-item-kind">{entry.label}</span>
                  <span className="ticket-item-title">
                    {href ? (
                      <Link href={href} className="ticket-item-link">
                        {entry.title}
                      </Link>
                    ) : (
                      entry.title
                    )}
                  </span>
                </span>
                {entry.price && <span className="ticket-item-price">{entry.price}</span>}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="ticket-tear" aria-hidden="true" />

      <div className="ticket-stub">
        {facts.length > 0 && (
          <dl className="ticket-facts">
            {facts.map((fact) => (
              <div key={fact.label} className="ticket-fact">
                <dt className="ticket-fact-label">
                  <Icon name={fact.icon} size={14} />
                  {fact.label}
                </dt>
                <dd className="ticket-fact-value">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {details?.message && (
          <p className="ticket-wish">
            <span className="ticket-wish-label">{t.ticket.wishes}</span>
            {details.message}
          </p>
        )}
        {children}
      </div>
    </article>
  );
}
