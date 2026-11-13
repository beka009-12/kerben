"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { useHeaderMenu } from "@/utils/layout/use-header-menu";
import "./header-menu.css";

export function HeaderMenu({
  label,
  items,
  active,
  isActive,
}: {
  label: string;
  items: { href: string; label: string }[];
  active: boolean;
  isActive: (href: string) => boolean;
}) {
  const { open, setOpen, rootRef, buttonRef, menuId, buttonClass } = useHeaderMenu({ active });

  return (
    <div ref={rootRef} className="header-menu">
      <button
        ref={buttonRef}
        type="button"
        className={buttonClass}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <Icon name="chevronDown" size={16} className={open ? "header-menu-chevron header-menu-chevron-open" : "header-menu-chevron"} />
      </button>
      {open && (
        <div id={menuId} className="header-menu-panel">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "header-menu-link header-menu-link-active" : "header-menu-link"}
              aria-current={isActive(item.href) ? "page" : undefined}
              onNavigate={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
