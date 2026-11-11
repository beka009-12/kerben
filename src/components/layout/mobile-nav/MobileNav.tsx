"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { useMobileNav } from "@/utils/layout/use-mobile-nav";
import "./mobile-nav.css";

export function MobileNav() {
  const { items, activeIndex } = useMobileNav();

  return (
    <nav className="mobile-nav" aria-label="Bottom">
      <div className="mobile-nav-bar" style={{ "--nav-count": items.length, "--nav-index": activeIndex } as CSSProperties}>
        {activeIndex >= 0 && <span className="mobile-nav-pill" aria-hidden="true" />}
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.active ? "mobile-nav-item mobile-nav-item-active" : "mobile-nav-item"}
            aria-current={item.active ? "page" : undefined}
          >
            <span className="mobile-nav-icon">
              <Icon name={item.icon} size={23} strokeWidth={item.active ? 2.2 : 1.8} />
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
