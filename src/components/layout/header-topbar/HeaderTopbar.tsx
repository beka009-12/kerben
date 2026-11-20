import { Icon, type IconName } from "@/components/ui/icon/Icon";
import type { SiteContacts } from "@/utils/api/contacts";
import "./header-topbar.css";

interface TopbarLink {
  icon: IconName;
  text: string;
  href: string;
  className?: string;
  external?: boolean;
}

export interface HeaderTopbarLabels {
  contacts: string;
  hours: string;
  hoursText: string;
}

function TopbarAnchor({ link }: { link: TopbarLink }) {
  return (
    <a
      href={link.href}
      className={link.className ? `header-topbar-link ${link.className}` : "header-topbar-link"}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <Icon name={link.icon} size={15} />
      {link.text}
    </a>
  );
}

/** Контакты над шапкой: позвонить или написать можно с любой страницы, не открывая «Контакты» */
export function HeaderTopbar({ contacts, labels }: { contacts: SiteContacts; labels: HeaderTopbarLabels }) {
  const reach: TopbarLink[] = [];
  if (contacts.phone && contacts.phoneHref) reach.push({ icon: "phone", text: contacts.phone, href: contacts.phoneHref, className: "header-topbar-phone" });
  if (contacts.email) reach.push({ icon: "mail", text: contacts.email, href: `mailto:${contacts.email}` });
  if (contacts.whatsappHref) reach.push({ icon: "whatsapp", text: "WhatsApp", href: contacts.whatsappHref, external: true });
  if (contacts.telegramHref) reach.push({ icon: "telegram", text: "Telegram", href: contacts.telegramHref, external: true });

  return (
    <div className="header-topbar">
      <div className="container-wide header-topbar-inner">
        <ul className="header-topbar-list" aria-label={labels.contacts}>
          {reach.map((link) => (
            <li key={link.href} className="header-topbar-item">
              <TopbarAnchor link={link} />
            </li>
          ))}
        </ul>
        <div className="header-topbar-side">
          <p className="header-topbar-hours">
            <Icon name="clock" size={15} />
            <span className="visually-hidden">{labels.hours}:</span>
            {labels.hoursText}
          </p>
          {contacts.instagramHref && <TopbarAnchor link={{ icon: "instagram", text: "Instagram", href: contacts.instagramHref, external: true }} />}
        </div>
      </div>
    </div>
  );
}
