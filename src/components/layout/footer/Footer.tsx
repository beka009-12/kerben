import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { Logo } from "@/components/ui/logo/Logo";
import { siteConfig } from "@/config/site";
import type { SiteContacts } from "@/utils/api/contacts";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./footer.css";

export function Footer({ locale, dict, contacts }: { locale: Locale; dict: Dictionary; contacts: SiteContacts }) {
  const base = `/${locale}`;
  const t = dict.footer;

  const links: { name: string; icon: IconName; href: string | null }[] = [
    { name: "Instagram", icon: "instagram", href: contacts.instagramHref },
    { name: "WhatsApp", icon: "whatsapp", href: contacts.whatsappHref },
    { name: "Telegram", icon: "send", href: contacts.telegramHref },
    { name: "Facebook", icon: "facebook", href: contacts.facebookHref },
    { name: "Email", icon: "mail", href: contacts.email ? `mailto:${contacts.email}` : null },
  ];
  const socials = links.filter((item): item is { name: string; icon: IconName; href: string } => Boolean(item.href));

  const company = [
    { href: `${base}/about`, label: t.aboutLink },
    { href: `${base}/tours`, label: dict.nav.tours },
    { href: `${base}/destinations`, label: dict.nav.destinations },
    { href: `${base}/trips`, label: dict.nav.trips },
  ];

  const travel = [
    { href: `${base}#custom`, label: t.custom },
    { href: `${base}#experiences`, label: t.experiences },
    { href: `${base}/hotels`, label: t.centers },
    { href: `${base}/trekking`, label: dict.nav.trekking },
    { href: `${base}/transport`, label: dict.nav.transport },
    { href: `${base}/helicopter`, label: dict.nav.helicopter },
    { href: `${base}#central-asia`, label: t.centralAsia },
    { href: `${base}/chat`, label: t.guide },
    { href: `${base}/faq`, label: t.faq },
  ];

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p className="footer-tagline">{t.tagline}</p>
          <p className="footer-countries">{t.countries}</p>
          <ul className="footer-socials">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target={social.icon === "mail" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="footer-social"
                >
                  <Icon name={social.icon} size={18} />
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="footer-column" aria-labelledby="footer-company">
          <h2 id="footer-company" className="footer-title">
            {t.company}
          </h2>
          <ul className="footer-list">
            {company.map((link) => (
              <li key={link.href}>
                <Link className="footer-link" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-column" aria-labelledby="footer-travel">
          <h2 id="footer-travel" className="footer-title">
            {t.travel}
          </h2>
          <ul className="footer-list">
            {travel.map((link) => (
              <li key={link.href}>
                <Link className="footer-link" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-column">
          <h2 className="footer-title">{dict.nav.contact}</h2>
          <ul className="footer-list">
            {contacts.phone && contacts.phoneHref && (
              <li>
                <a className="footer-link" href={contacts.phoneHref}>
                  {contacts.phone}
                </a>
              </li>
            )}
            {contacts.email && (
              <li>
                <a className="footer-link" href={`mailto:${contacts.email}`}>
                  {contacts.email}
                </a>
              </li>
            )}
          </ul>
          <Link href={`${base}/chat`} className="footer-cta">
            <Icon name="chat" size={18} />
            {dict.nav.chat}
          </Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © {siteConfig.year} {siteConfig.name}
        </span>
        <ul className="footer-legal">
          <li>
            <Link className="footer-link" href={`${base}/about`}>
              {t.privacy}
            </Link>
          </li>
          <li>
            <Link className="footer-link" href={`${base}/about`}>
              {t.terms}
            </Link>
          </li>
          <li>
            <Link className="footer-link" href={`${base}/credits`}>
              {t.credits}
            </Link>
          </li>
        </ul>
      </div>

      <p className="footer-wordmark" aria-hidden="true">
        {siteConfig.name}
      </p>
    </footer>
  );
}
