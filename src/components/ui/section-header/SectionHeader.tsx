import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import "./section-header.css";

interface SectionHeaderProps {
  id?: string;
  kicker?: string;
  title: string;
  text?: string;
  link?: { href: string; label: string };
  action?: ReactNode;
  light?: boolean;
}

export function SectionHeader({ id, kicker, title, text, link, action, light = false }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header-copy">
        {kicker && <p className="section-header-kicker">{kicker}</p>}
        <h2 id={id} className={light ? "section-header-title section-header-title-light" : "section-header-title"}>
          {title}
        </h2>
        {text && <p className={light ? "section-header-text section-header-text-light" : "section-header-text"}>{text}</p>}
      </div>
      {link && (
        <Link href={link.href} className="section-header-link">
          {link.label}
          <Icon name="arrowRight" size={18} />
        </Link>
      )}
      {action}
    </div>
  );
}
