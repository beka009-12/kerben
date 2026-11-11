"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { useAiBookingCard, type BackendConfirm } from "@/utils/ai/use-ai-booking-card";
import type { BookingContext, BookingDraft } from "@/utils/booking-chat";
import "./ai-booking-card.css";

export function AiBookingCard({ draft, context, confirm }: { draft: BookingDraft; context: BookingContext | null; confirm?: BackendConfirm }) {
  const { locale, dict, t, sentId, status, sent, valid, items, details, wish, send, strip, scrollable } = useAiBookingCard({ draft, context, confirm });
  const { ref: stripRef, atStart, atEnd, onScroll, prev, next } = strip;

  return (
    <section className={sent ? "ai-booking-card ai-booking-card-sent" : "ai-booking-card"} aria-label={t.cardTitle}>
      <header className="ai-booking-card-head">
        <span className="ai-booking-card-icon" aria-hidden="true">
          <Icon name={sent ? "check" : "ticket"} size={20} />
        </span>
        <div className="ai-booking-card-heading">
          <h3 className="ai-booking-card-title">{sent ? t.sentTitle : t.cardTitle}</h3>
          <p className="ai-booking-card-sub">{sent ? t.sent.replace("{id}", sentId) : t.checkText}</p>
        </div>
      </header>

      {items.length > 0 && (
        <div className="ai-booking-card-block">
          <p className="ai-booking-card-caption">
            {t.chosen}
            <span className="ai-booking-card-count">{items.length}</span>
          </p>
          <div className="ai-booking-card-strip">
            {scrollable && !atStart && (
              <button type="button" className="ai-booking-card-arrow ai-booking-card-arrow-prev" onClick={prev} aria-label={dict.a11y.prev}>
                <Icon name="chevronLeft" size={18} />
              </button>
            )}
            {scrollable && !atEnd && (
              <button type="button" className="ai-booking-card-arrow ai-booking-card-arrow-next" onClick={next} aria-label={dict.a11y.next}>
                <Icon name="chevronRight" size={18} />
              </button>
            )}
            <ul
              ref={stripRef}
              onScroll={onScroll}
              className={items.length === 1 ? "ai-booking-card-items ai-booking-card-items-single" : "ai-booking-card-items"}
            >
              {items.map((item) => (
                <li key={item.key} className="ai-booking-card-item">
                  <span className="ai-booking-card-photo">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="(min-width: 640px) 220px, 70vw" className="ai-booking-card-image" />
                    ) : (
                      <Icon name={item.icon} size={28} />
                    )}
                    <span className="ai-booking-card-kind">
                      <Icon name={item.icon} size={13} />
                      {item.kind}
                    </span>
                  </span>
                  <span className="ai-booking-card-item-body">
                    {item.href ? (
                      <Link href={item.href} className="ai-booking-card-item-title">
                        {item.title}
                      </Link>
                    ) : (
                      <span className="ai-booking-card-item-title">{item.title}</span>
                    )}
                    {item.price && <span className="ai-booking-card-item-price">{item.price}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="ai-booking-card-block">
        <p className="ai-booking-card-caption">{t.details}</p>
        <dl className="ai-booking-card-details">
          {details.map((row) => (
            <div key={row.label} className={row.wide ? "ai-booking-card-detail ai-booking-card-detail-wide" : "ai-booking-card-detail"}>
              <dt className="ai-booking-card-label">
                <Icon name={row.icon} size={14} />
                {row.label}
              </dt>
              <dd className="ai-booking-card-value">{row.value}</dd>
            </div>
          ))}
        </dl>
        {wish && (
          <div className="ai-booking-card-wish">
            <span className="ai-booking-card-label">
              <Icon name="chat" size={14} />
              {t.message}
            </span>
            <p className="ai-booking-card-wish-text">{wish}</p>
          </div>
        )}
      </div>

      {sent ? (
        <Link href={`/${locale}/trips`} className="ai-booking-card-link">
          {t.myRequests}
          <Icon name="arrowRight" size={16} />
        </Link>
      ) : (
        <div className="ai-booking-card-actions">
          {valid ? (
            <button type="button" className="ai-booking-card-send" onClick={send} disabled={status === "sending"}>
              {status === "sending" ? t.sending : t.send}
              {status !== "sending" && <Icon name="send" size={18} />}
            </button>
          ) : (
            <p className="ai-booking-card-warning" role="alert">
              {t.invalid}
            </p>
          )}
          <p
            className={status === "error" ? "ai-booking-card-note ai-booking-card-note-error" : "ai-booking-card-note"}
            role={status === "error" ? "alert" : undefined}
          >
            <Icon name={status === "error" ? "x" : "shield"} size={14} />
            {status === "error" ? t.error : t.note}
          </p>
        </div>
      )}
    </section>
  );
}
