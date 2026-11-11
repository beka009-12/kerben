import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import "./section-header.css";

export function SectionHeader({
  id,
  title,
  text,
  link,
  light = false,
}: {
  id?: string;
  title: string;
  text?: string;
  link?: { href: string; label: string };
  light?: boolean;
}) {
  return (
    <div className="section-header">
      <div className="section-header-copy">
        <h2 id={id} className={light ? "section-header-title section-header-title-light" : "section-header-title"}>
          {title}
        </h2>
        {text && <p className={light ? "section-header-text section-header-text-light" : "section-header-text"}>{text}</p>}
      </div>
      {link && (
        <Link href={link.href} className="section-header-link">
          {link.label}
          <Icon name="arrowRight" size={16} />
        </Link>
      )}
    </div>
  );
}
