import { Icon, type IconName } from "@/components/ui/icon/Icon";
import type { SiteContacts } from "@/utils/api/contacts";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./contact-info.css";

export function ContactInfo({ dict, contacts }: { dict: Dictionary; contacts: SiteContacts }) {
  const t = dict.contact;
  const items: { icon: IconName; label: string; value: string; href?: string }[] = [
    ...(contacts.phone && contacts.phoneHref ? [{ icon: "phone" as IconName, label: t.phone, value: contacts.phone, href: contacts.phoneHref }] : []),
    ...(contacts.email ? [{ icon: "mail" as IconName, label: t.email, value: contacts.email, href: `mailto:${contacts.email}` }] : []),
    { icon: "mapPin", label: t.office, value: contacts.address || t.officeText },
    { icon: "clock", label: t.hours, value: t.hoursText },
  ];

  return (
    <ul className="contact-info">
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
          </span>
        </li>
      ))}
    </ul>
  );
}
