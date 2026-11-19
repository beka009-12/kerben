import type { ReactNode } from "react";
import { TwoGisLink } from "@/components/common/two-gis-link/TwoGisLink";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import type { SiteContacts } from "@/utils/api/contacts";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./contact-info.css";

export function ContactInfo({ dict, contacts, locale }: { dict: Dictionary; contacts: SiteContacts; locale: Locale }) {
  const t = dict.contact;
  const items: { icon: IconName; label: string; value: string; href?: string; extra?: ReactNode }[] = [
    ...(contacts.phone && contacts.phoneHref ? [{ icon: "phone" as IconName, label: t.phone, value: contacts.phone, href: contacts.phoneHref }] : []),
    ...(contacts.email ? [{ icon: "mail" as IconName, label: t.email, value: contacts.email, href: `mailto:${contacts.email}` }] : []),
    {
      icon: "mapPin",
      label: t.office,
      value: contacts.address || t.officeText,
      extra: <TwoGisLink locale={locale} labels={{ text: t.twoGis, label: t.twoGisLabel }} className="contact-info-2gis" />,
    },
    { icon: "clock", label: t.hours, value: t.hoursText },
  ];

  return (
    <div className="contact-info">
      <div className="contact-info-head">
        <p className="contact-info-kicker">{t.cardKicker}</p>
        <h2 className="contact-info-title">{t.cardTitle}</h2>
        <p className="contact-info-text">{t.cardText}</p>
      </div>
      <ul className="contact-info-list">
        {items.map((item) => (
          <li key={item.label} className="contact-info-item">
            <span className="contact-info-icon">
              <Icon name={item.icon} size={20} />
            </span>
            <span className="contact-info-body">
              <span className="contact-info-label">{item.label}</span>
              {item.href ? (
                <a href={item.href} className="contact-info-value contact-info-link">
                  {item.value}
                </a>
              ) : (
                <span className="contact-info-value">{item.value}</span>
              )}
              {item.extra}
            </span>
          </li>
        ))}
      </ul>
      {contacts.phoneHref && (
        <a href={contacts.phoneHref} className="contact-info-call">
          <Icon name="phone" size={20} />
          {t.call}
        </a>
      )}
    </div>
  );
}
