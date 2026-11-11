"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { Logo } from "@/components/ui/logo/Logo";
import { useAdminShell, type NavItem } from "@/utils/admin/use-admin-shell";
import "./admin-shell.css";

export function AdminShell({
  admin,
  lang,
  siteUrl,
  newRequests,
  children,
}: {
  admin: { username: string };
  lang: string;
  siteUrl: string;
  newRequests: number;
  children: ReactNode;
}) {
  const { menuOpen, setMenuOpen, base, top, groups, signOut, current, isActive } = useAdminShell({ lang, newRequests });

  const link = (item: NavItem) => (
    <li key={item.href}>
      <Link
        href={item.href}
        className={isActive(item.href) ? "admin-shell-link admin-shell-link-active" : "admin-shell-link"}
        aria-current={isActive(item.href) ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        <Icon name={item.icon} size={18} />
        <span className="admin-shell-link-label">{item.label}</span>
        {item.badge ? <span className="admin-shell-badge">{item.badge}</span> : null}
      </Link>
    </li>
  );

  return (
    <div className="admin-shell">
      <aside id="admin-menu" className={menuOpen ? "admin-shell-side admin-shell-side-open" : "admin-shell-side"} aria-label="Разделы админки">
        <div className="admin-shell-side-head">
          <Link href={base} className="admin-shell-brand" aria-label="Админка Kerben Travel — обзор" onClick={() => setMenuOpen(false)}>
            <Logo light />
          </Link>
          <button type="button" className="admin-shell-icon-btn admin-shell-side-close" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню">
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="admin-shell-nav">
          <ul className="admin-shell-list">{top.map(link)}</ul>
          {groups.map((group) => (
            <div key={group.title} className="admin-shell-group">
              <p className="admin-shell-group-title">{group.title}</p>
              <ul className="admin-shell-list">{group.items.map(link)}</ul>
            </div>
          ))}
        </nav>

        <div className="admin-shell-side-foot">
          <span className="admin-shell-avatar" aria-hidden="true">
            {admin.username.slice(0, 1).toUpperCase()}
          </span>
          <span className="admin-shell-who">
            <span className="admin-shell-name">{admin.username}</span>
            <span className="admin-shell-role">Администратор</span>
          </span>
        </div>
      </aside>

      {menuOpen && <button type="button" className="admin-shell-scrim" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)} />}

      <div className="admin-shell-page">
        <header className="admin-shell-bar">
          <button
            type="button"
            className="admin-shell-icon-btn admin-shell-burger"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
          >
            <Icon name="menu" size={22} />
            {newRequests > 0 && <span className="admin-shell-dot" aria-hidden="true" />}
          </button>
          <Link href={base} className="admin-shell-bar-brand" aria-label="Админка Kerben Travel — обзор">
            <Logo />
          </Link>
          <p className="admin-shell-crumb">
            <Link href={base} className="admin-shell-crumb-root">
              Админка
            </Link>
            <Icon name="chevronRight" size={14} className="admin-shell-crumb-sep" />
            <span className="admin-shell-crumb-current">{current.label}</span>
          </p>

          <div className="admin-shell-bar-actions">
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="admin-shell-action" title="Открыть сайт">
              <Icon name="globe" size={18} />
              <span className="admin-shell-action-label">Открыть сайт</span>
            </a>
            <form action={signOut}>
              <button type="submit" className="admin-shell-action admin-shell-logout" title="Выйти">
                <Icon name="logout" size={18} />
                <span className="admin-shell-action-label">Выйти</span>
              </button>
            </form>
          </div>
        </header>

        <main className="admin-shell-main">
          {current.href !== base && (
            <Link href={base} className="admin-shell-back">
              <Icon name="arrowLeft" size={16} />
              Назад
            </Link>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
