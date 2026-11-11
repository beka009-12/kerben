"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { HeaderMenu } from "@/components/layout/header-menu/HeaderMenu";
import { HeaderSearch } from "@/components/layout/header-search/HeaderSearch";
import { LanguageSwitcher } from "@/components/layout/language-switcher/LanguageSwitcher";
import { Icon } from "@/components/ui/icon/Icon";
import { Logo } from "@/components/ui/logo/Logo";
import type { SiteContacts } from "@/utils/api/contacts";
import { useHeader } from "@/utils/layout/use-header";
import type { SearchItem } from "@/utils/search";
import "./header.css";

export function Header({ searchItems, contacts }: { searchItems: SearchItem[]; contacts: SiteContacts }) {
  const { burgerRef, dict, ...h } = useHeader();

  return (
    <header className={h.headerClass}>
      <div className="container">
        <div className="header-bar">
        <Link href={h.base} className="header-brand" aria-label={dict.a11y.home} onNavigate={h.close}>
          <Logo />
        </Link>

        <nav className="header-nav" aria-label="Main">
          {h.mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={h.linkClass(link.href)}
              aria-current={h.isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <HeaderMenu
            label={dict.nav.services}
            items={h.services}
            active={h.services.some((item) => h.isActive(item.href))}
            isActive={h.isActive}
          />
          {h.tailLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={h.linkClass(link.href)}
              aria-current={h.isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="header-desktop-only">
            <LanguageSwitcher id="lang-desktop" />
          </div>
          <HeaderSearch items={searchItems} />
          <Link
            href={`${h.base}/trips`}
            className="header-icon"
            aria-label={`${dict.nav.trips}${h.tripsCount ? ` (${h.tripsCount})` : ""}`}
            title={dict.nav.trips}
            onNavigate={h.close}
          >
            <Icon name="suitcase" size={20} />
            {h.tripsCount > 0 && <span className="header-badge">{h.tripsCount}</span>}
          </Link>
          <button
            ref={burgerRef}
            type="button"
            className="header-burger"
            aria-expanded={h.open}
            aria-controls="mobile-menu"
            aria-label={h.open ? dict.a11y.closeMenu : dict.a11y.openMenu}
            onClick={h.toggle}
          >
            <Icon name={h.open ? "close" : "menu"} size={24} />
          </button>
        </div>
        </div>
      </div>

      <div id="mobile-menu" className="header-drawer" hidden={!h.open}>
        <nav className="container header-drawer-nav" aria-label="Mobile">
          <div className="header-drawer-groups">
            {h.drawerGroups.map((group, g) => (
              <section key={group.title} className="header-drawer-group" aria-label={group.title}>
                <p className="header-drawer-title">{group.title}</p>
                <ul className="header-drawer-list">
                  {group.items.map((link, i) => (
                    <li key={link.href} className="header-drawer-item" style={{ "--i": g * 5 + i } as CSSProperties}>
                      <Link
                        href={link.href}
                        className={h.isActive(link.href) ? "header-drawer-link header-drawer-link-active" : "header-drawer-link"}
                        aria-current={h.isActive(link.href) ? "page" : undefined}
                        onNavigate={h.close}
                      >
                        <span className="header-drawer-icon">
                          <Icon name={link.icon} size={20} />
                        </span>
                        <span className="header-drawer-label">{link.label}</span>
                        <Icon name="chevronRight" size={18} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="header-drawer-footer">
            <LanguageSwitcher id="lang-mobile" variant="inline" />
          </div>

          {(contacts.phoneHref || contacts.whatsappHref || contacts.instagramHref) && (
            <div className="header-drawer-contacts">
              {contacts.phone && contacts.phoneHref && (
                <a href={contacts.phoneHref} className="header-drawer-contact">
                  <Icon name="phone" size={18} />
                  {contacts.phone}
                </a>
              )}
              {contacts.whatsappHref && (
                <a href={contacts.whatsappHref} target="_blank" rel="noopener noreferrer" className="header-drawer-social" aria-label="WhatsApp">
                  <Icon name="whatsapp" size={20} />
                </a>
              )}
              {contacts.instagramHref && (
                <a href={contacts.instagramHref} target="_blank" rel="noopener noreferrer" className="header-drawer-social" aria-label="Instagram">
                  <Icon name="instagram" size={20} />
                </a>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
