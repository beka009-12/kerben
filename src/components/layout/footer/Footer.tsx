import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { Logo } from "@/components/ui/logo/Logo";
import { siteConfig } from "@/config/site";
import type { SiteContacts } from "@/utils/api/contacts";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./footer.css";

interface FooterLink {
  href: string;
  label: string;
}

interface SocialLink {
  name: string;
  icon: IconName;
  href: string;
}

function FooterColumn({ id, title, links, children }: { id: string; title: string; links: FooterLink[]; children?: ReactNode }) {
  return (
    <nav className="footer-column" aria-labelledby={id}>
      <h2 id={id} className="footer-title">
        {title}
      </h2>
      <ul className="footer-list">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link className="footer-link" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
        {children}
      </ul>
    </nav>
  );
}

export function Footer({ locale, dict, contacts }: { locale: Locale; dict: Dictionary; contacts: SiteContacts }) {
  const base = `/${locale}`;
  const t = dict.footer;

  const candidates: { name: string; icon: IconName; href: string | null }[] = [
    { name: "WhatsApp", icon: "chatBubble", href: contacts.whatsappHref },
    { name: "Telegram", icon: "telegram", href: contacts.telegramHref },
    { name: "Instagram", icon: "instagram", href: contacts.instagramHref },
    { name: "Facebook", icon: "facebook", href: contacts.facebookHref },
  ];
  const socials = candidates.filter((item): item is SocialLink => Boolean(item.href));

  const company: FooterLink[] = [
    { href: `${base}/about`, label: t.aboutLink },
    { href: `${base}/tours`, label: dict.nav.tours },
    { href: `${base}/attractions`, label: dict.nav.attractions },
    { href: `${base}/destinations`, label: dict.nav.destinations },
    { href: `${base}/trips`, label: dict.nav.trips },
  ];

  const travel: FooterLink[] = [
    { href: `${base}#custom`, label: t.custom },
    { href: `${base}#experiences`, label: t.experiences },
    { href: `${base}/hotels`, label: t.centers },
    { href: `${base}/trekking`, label: dict.nav.trekking },
    { href: `${base}/transport`, label: dict.nav.transport },
    { href: `${base}/helicopter`, label: dict.nav.helicopter },
    { href: `${base}#central-asia`, label: t.centralAsia },
  ];

  const guide: FooterLink[] = [
    { href: `${base}/faq`, label: t.faq },
    { href: `${base}/contact`, label: dict.nav.contact },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">
              <Logo light size="lg" />
            </span>
            <p className="footer-motto">{t.motto}</p>
            <p className="footer-note">{t.tagline}</p>
            <p className="footer-note">{t.countries}</p>
          </div>

          <FooterColumn id="footer-company" title={t.company} links={company} />
          <FooterColumn id="footer-travel" title={t.travel} links={travel} />
          <FooterColumn id="footer-guide" title={t.guide} links={guide}>
            {contacts.phone && contacts.phoneHref && (
              <li>
                <a className="footer-link" href={contacts.phoneHref}>
                  {contacts.phone}
                </a>
              </li>
            )}
            <li>
              <Link className="footer-link" href={`${base}/chat`}>
                {dict.nav.chat}
              </Link>
            </li>
            {socials.length > 0 && (
              <li className="footer-socials">
                {socials.map((social) => (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label={social.name}>
                    <Icon name={social.icon} size={24} />
                  </a>
                ))}
              </li>
            )}
          </FooterColumn>
        </div>

        <div className="footer-bottom">
          <span>
            © {siteConfig.year} {siteConfig.name}
          </span>
          <ul className="footer-legal">
            <li>
              <Link className="footer-legal-link" href={`${base}/about`}>
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link className="footer-legal-link" href={`${base}/about`}>
                {t.terms}
              </Link>
            </li>
            <li>
              <Link className="footer-legal-link" href={`${base}/credits`}>
                {t.credits}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
