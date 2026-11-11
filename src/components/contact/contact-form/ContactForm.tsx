"use client";

import { Icon } from "@/components/ui/icon/Icon";
import type { SiteContacts } from "@/utils/api/contacts";
import { useContactForm } from "@/utils/contact/use-contact-form";
import "./contact-form.css";

export function ContactForm({ contacts }: { contacts: Pick<SiteContacts, "whatsappHref" | "telegramHref"> }) {
  const { t, name, setName, message, setMessage, whatsappHref, telegramHref, copyForTelegram, copied, id } = useContactForm(contacts);

  return (
    <div className="contact-form">
      <div className="contact-form-field">
        <label htmlFor={id("name")} className="contact-form-label">{t.name}</label>
        <input id={id("name")} className="contact-form-input" value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="contact-form-field">
        <label htmlFor={id("message")} className="contact-form-label">{t.message}</label>
        <textarea
          id={id("message")}
          className="contact-form-input contact-form-textarea"
          rows={5}
          value={message}
          placeholder={t.messagePh}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <p className="contact-form-hint">{t.messengerHint}</p>
      <div className="contact-form-actions">
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="button button-primary button-lg contact-form-messenger">
            <Icon name="whatsapp" size={20} />
            {t.whatsapp}
          </a>
        )}
        {telegramHref && (
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-outline button-lg contact-form-messenger"
            onClick={() => void copyForTelegram()}
          >
            <Icon name="send" size={20} />
            {t.telegram}
          </a>
        )}
      </div>
      {copied && (
        <p className="contact-form-success" role="status">
          {t.copied}
        </p>
      )}
    </div>
  );
}
