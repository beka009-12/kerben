"use client";

import { Icon } from "@/components/ui/icon/Icon";
import type { SiteContacts } from "@/utils/api/contacts";
import { useContactForm } from "@/utils/contact/use-contact-form";
import "./contact-form.css";

export function ContactForm({ contacts }: { contacts: Pick<SiteContacts, "whatsappHref" | "telegramHref"> }) {
  const f = useContactForm(contacts);
  const { t, id } = f;

  const field = (key: string, label: string, value: string, set: (value: string) => void, placeholder: string, optional = false, autoComplete?: string) => (
    <div className="contact-form-field">
      <label htmlFor={id(key)} className="contact-form-label">
        {label}
        {optional && <span className="contact-form-optional">{t.optional}</span>}
      </label>
      <input id={id(key)} className="contact-form-input" value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => set(e.target.value)} />
    </div>
  );

  return (
    <div className="contact-form">
      <div className="contact-form-head">
        <h2 className="contact-form-title">{t.formTitle}</h2>
        <p className="contact-form-text">{t.formText}</p>
      </div>
      <div className="contact-form-row">
        {field("name", t.name, f.name, f.setName, t.namePh, false, "name")}
        {field("dates", t.dates, f.dates, f.setDates, t.datesPh, true)}
      </div>
      <div className="contact-form-row">
        {field("people", t.people, f.people, f.setPeople, t.peoplePh, true)}
        {field("interests", t.interests, f.interests, f.setInterests, t.interestsPh, true)}
      </div>
      <div className="contact-form-field">
        <label htmlFor={id("message")} className="contact-form-label">
          {t.message}
        </label>
        <textarea
          id={id("message")}
          className="contact-form-input contact-form-textarea"
          rows={4}
          value={f.message}
          placeholder={t.messagePh}
          onChange={(e) => f.setMessage(e.target.value)}
        />
      </div>
      {(f.whatsappHref || f.telegramHref) && (
        <div className="contact-form-send">
          <p className="contact-form-label">{t.sendVia}</p>
          <div className="contact-form-row">
            {f.whatsappHref && (
              <a href={f.whatsappHref} target="_blank" rel="noopener noreferrer" className="contact-form-messenger contact-form-messenger-whatsapp">
                <Icon name="chatBubble" size={20} />
                WhatsApp
              </a>
            )}
            {f.telegramHref && (
              <a
                href={f.telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-form-messenger contact-form-messenger-telegram"
                onClick={() => void f.copyForTelegram()}
              >
                <Icon name="telegram" size={20} />
                Telegram
              </a>
            )}
          </div>
        </div>
      )}
      {f.copied && (
        <p className="contact-form-success" role="status">
          {t.copied}
        </p>
      )}
      <p className="contact-form-note">
        <Icon name="clock" size={16} />
        {t.replyNote}
      </p>
    </div>
  );
}
