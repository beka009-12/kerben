"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { IconName } from "@/components/ui/icon/Icon";
import { useActiveRequests } from "@/utils/hooks/useActiveRequests";
import { useScrolled } from "@/utils/hooks/useScrolled";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useFavorites } from "@/utils/store/favorites";

export interface HeaderLink {
  href: string;
  label: string;
}

export interface DrawerGroup {
  title: string;
  items: (HeaderLink & { icon: IconName })[];
}

export function useHeader() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const savedCount = useFavorites((state) => state.slugs.length);
  const activeRequests = useActiveRequests();

  const base = `/${locale}`;
  const tripsCount = savedCount + activeRequests;

  const services: HeaderLink[] = [
    { href: `${base}/transport`, label: dict.nav.transport },
    { href: `${base}/trekking`, label: dict.nav.trekking },
    { href: `${base}/helicopter`, label: dict.nav.helicopter },
  ];
  const mainLinks: HeaderLink[] = [
    { href: base, label: dict.nav.home },
    { href: `${base}/tours`, label: dict.nav.tours },
    { href: `${base}/hotels`, label: dict.nav.hotels },
  ];
  const aboutLink: HeaderLink = { href: `${base}/about`, label: dict.nav.about };
  const chatLink: HeaderLink = { href: `${base}/chat`, label: dict.nav.chat };
  const drawerGroups: DrawerGroup[] = [
    {
      title: dict.footer.travel,
      items: [
        { href: base, label: dict.nav.home, icon: "home" },
        { href: `${base}/destinations`, label: dict.nav.destinations, icon: "compass" },
        { href: `${base}/tours`, label: dict.nav.tours, icon: "route" },
        { href: `${base}/hotels`, label: dict.nav.hotels, icon: "bed" },
        { href: `${base}/chat`, label: dict.nav.chat, icon: "chat" },
      ],
    },
    {
      title: dict.nav.services,
      items: [
        { href: services[0].href, label: services[0].label, icon: "car" },
        { href: services[1].href, label: services[1].label, icon: "mountain" },
        { href: services[2].href, label: services[2].label, icon: "helicopter" },
      ],
    },
    {
      title: dict.footer.company,
      items: [
        { href: `${base}/trips`, label: dict.nav.trips, icon: "suitcase" },
        { href: `${base}/about`, label: dict.nav.about, icon: "users" },
        { href: `${base}/faq`, label: dict.footer.faq, icon: "help" },
      ],
    },
  ];

  const isActive = (href: string) => (href === base ? pathname === base : pathname.startsWith(href));
  const linkClass = (href: string) => {
    return isActive(href) ? "header-link header-link-active" : "header-link";
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useLayoutEffect(() => () => setOpen(false), []);

  // Плашка всегда белая и всегда на месте; при прокрутке тень сильнее
  const headerClass = ["header", scrolled || open ? "header-raised" : "", open ? "header-open" : ""].filter(Boolean).join(" ");

  return {
    dict,
    base,
    open,
    burgerRef,
    tripsCount,
    services,
    mainLinks,
    aboutLink,
    chatLink,
    drawerGroups,
    headerClass,
    isActive,
    linkClass,
    close: () => setOpen(false),
    toggle: () => setOpen((value) => !value),
  };
}
