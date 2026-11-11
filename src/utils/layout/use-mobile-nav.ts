"use client";

import { usePathname } from "next/navigation";
import type { IconName } from "@/components/ui/icon/Icon";
import { useI18n } from "@/utils/i18n/I18nProvider";

export function useMobileNav() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const base = `/${locale}`;
  const items: { href: string; label: string; icon: IconName }[] = [
    { href: base, label: dict.nav.home, icon: "home" },
    { href: `${base}/tours`, label: dict.nav.tours, icon: "route" },
    { href: `${base}/chat`, label: dict.nav.chat, icon: "chat" },
    { href: `${base}/destinations`, label: dict.nav.destinations, icon: "compass" },
    { href: `${base}/trips`, label: dict.nav.tripsShort, icon: "suitcase" },
  ];
  const list = items.map((item) => ({
    ...item,
    active: item.href === base ? pathname === base : pathname.startsWith(item.href),
  }));
  return { items: list, activeIndex: list.findIndex((item) => item.active) };
}
