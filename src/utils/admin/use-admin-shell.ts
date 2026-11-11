"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { adminSignOut } from "@/app/[lang]/admin/actions";
import { type IconName } from "@/components/ui/icon/Icon";
import { MENU, RESOURCES } from "@/utils/admin/resources";
import { useAdminLive } from "@/utils/admin/use-admin-live";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
}

export function useAdminShell({ lang, newRequests }: Pick<{
  admin: { username: string };
  lang: string;
  siteUrl: string;
  newRequests: number;
  children: ReactNode;
}, "lang" | "newRequests">) {
  const pathname = usePathname();
  useAdminLive();
  const [menuOpen, setMenuOpen] = useState(false);
  const base = `/${lang}/admin`;

  const top: NavItem[] = [
    { href: base, label: "Обзор", icon: "layout" },
    { href: `${base}/requests`, label: "Заявки", icon: "inbox", badge: newRequests },
  ];
  const groups = MENU.map((group) => ({
    title: group.title,
    items: group.items.map<NavItem>((key) => ({ href: `${base}/${key}`, label: RESOURCES[key].title, icon: RESOURCES[key].icon })),
  }));
  const all = [...top, ...groups.flatMap((group) => group.items)];
  async function signOut() {
    await adminSignOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${base}/login`);
  }

  const isActive = (href: string) => (href === base ? pathname === base : pathname === href || pathname.startsWith(`${href}/`));
  const current = all.find((item) => isActive(item.href)) ?? top[0];

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.documentElement.classList.add("admin-shell-locked");
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("admin-shell-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return { menuOpen, setMenuOpen, base, top, groups, signOut, current, isActive };
}
