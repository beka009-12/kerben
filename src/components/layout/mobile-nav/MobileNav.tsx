"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { useMobileNav } from "@/utils/layout/use-mobile-nav";
import { useNavDrag } from "@/utils/layout/use-nav-drag";
import "./mobile-nav.css";

export function MobileNav() {
  const { items, activeIndex } = useMobileNav();
  const { barRef, dragging, highlightIndex, handlers } = useNavDrag(items, activeIndex);

  return (
    <nav className="mobile-nav" aria-label="Bottom">
      <div
        ref={barRef}
        className="mobile-nav-bar"
        data-dragging={dragging ? "" : undefined}
        style={{ "--nav-count": items.length, "--nav-index": highlightIndex } as CSSProperties}
        {...handlers}
      >
        {(highlightIndex >= 0 || dragging) && <span className="mobile-nav-pill" aria-hidden="true" />}
        {items.map((item, i) => {
          const lit = i === highlightIndex;
          return (
            <Link
              key={item.href}
              href={item.href}
              draggable={false}
              className={lit ? "mobile-nav-item mobile-nav-item-active" : "mobile-nav-item"}
              aria-current={item.active ? "page" : undefined}
            >
              <span className="mobile-nav-icon">
                <Icon name={item.icon} size={23} strokeWidth={lit ? 2.2 : 1.8} />
              </span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
