"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import type { ManagerContacts } from "@/utils/contact/manager";
import { useManagerContact } from "@/utils/tour/use-manager-contact";
import "./booking-card.css";

export type BookingField =
  | { kind: "date"; key: string; label: string }
  | { kind: "count"; key: string; label: string; options: { value: number; label: string }[]; initial: number };

export interface BookingCardLabels {
  from: string;
  per: string;
  heading?: string;
  datePlaceholder: string;
  notChosen: string;
  book: string;
  whatsapp: string;
  telegram: string;
  ask: string;
  contactMessage: string;
  bookMessage: string;
  note?: string;
  reply?: string;
}

const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

export function BookingCard({
  title,
  price,
  meta,
  otherPrices = [],
  ratesNote,
  fields,
  contacts,
  chatHref,
  askHref,
  labels,
}: {
  title: string;
  price: string | null;
  meta?: { icon: IconName; text: string };
  otherPrices?: string[];
  ratesNote?: string;
  fields: BookingField[];
  contacts: ManagerContacts;
  chatHref: string;
  askHref: string;
  labels: BookingCardLabels;
}) {
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.kind === "count" ? String(field.initial) : ""])),
  );
  const { whatsappHref, telegramHref } = useManagerContact({ contacts, title, template: labels.contactMessage });
  const today = new Date().toISOString().slice(0, 10);

  const shown = (field: BookingField) => {
    const value = values[field.key] ?? "";
    if (field.kind === "date") return value ? formatDate(value) : "";
    return field.options.find((option) => String(option.value) === value)?.label ?? value;
  };
  const details = fields.map((field) => `${field.label}: ${shown(field) || labels.notChosen}`).join(". ");
  const message = labels.bookMessage.replace("{title}", title).replace("{details}", details);
  const set = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="booking-card">
      {price && (
        <p className="booking-card-price">
          <span className="booking-card-unit">{labels.from}</span>
          <strong className="booking-card-amount">{price}</strong>
          <span className="booking-card-unit">/ {labels.per}</span>
        </p>
      )}
      {otherPrices.length > 0 && (
        <p className="booking-card-other" title={ratesNote}>
          {otherPrices.map((item) => (
            <span key={item}>≈ {item}</span>
          ))}
        </p>
      )}
      {meta && (
        <p className="booking-card-meta">
          <Icon name={meta.icon} size={16} />
          {meta.text}
        </p>
      )}

      {labels.heading && <h3 className="booking-card-heading">{labels.heading}</h3>}

      {fields.map((field) => {
        const fieldId = `${id}-${field.key}`;
        const text = shown(field);
        return (
          <div key={field.key} className="booking-card-field">
            <label htmlFor={fieldId} className="booking-card-label">
              {field.label}
            </label>
            <span className="booking-card-control">
              <Icon name={field.kind === "date" ? "calendar" : "users"} size={16} className="booking-card-icon" />
              <span className={text ? "booking-card-value booking-card-value-set" : "booking-card-value"}>{text || labels.datePlaceholder}</span>
              {field.kind === "date" ? (
                <input
                  id={fieldId}
                  type="date"
                  value={values[field.key]}
                  min={today}
                  onChange={(event) => set(field.key, event.target.value)}
                  onClick={(event) => event.currentTarget.showPicker?.()}
                  className="booking-card-native"
                />
              ) : (
                <select id={fieldId} value={values[field.key]} onChange={(event) => set(field.key, event.target.value)} className="booking-card-native">
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </span>
          </div>
        );
      })}

      <Link href={`${chatHref}?ask=${encodeURIComponent(message)}`} className="booking-card-button booking-card-button-book">
        {labels.book}
      </Link>
      {whatsappHref && (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="booking-card-button booking-card-button-whatsapp">
          <Icon name="chatBubble" size={18} />
          {labels.whatsapp}
        </a>
      )}
      {telegramHref && (
        <a href={telegramHref} target="_blank" rel="noopener noreferrer" className="booking-card-button booking-card-button-telegram">
          <Icon name="telegram" size={18} />
          {labels.telegram}
        </a>
      )}
      <Link href={askHref} className="booking-card-button booking-card-button-ask">
        <Icon name="sparkle" size={18} />
        {labels.ask}
      </Link>
      {labels.note && <p className="booking-card-note">{labels.note}</p>}
      {labels.reply && <p className="booking-card-reply">{labels.reply}</p>}
    </div>
  );
}
