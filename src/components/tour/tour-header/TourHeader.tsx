import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./tour-header.css";

export interface TourHeaderMeta {
  icon?: "clock" | "mapPin" | "users" | "bed";
  text: string;
}

export function TourHeader({
  title,
  kicker,
  meta,
  section,
  locale,
  dict,
}: {
  title: string;
  kicker?: string;
  meta: TourHeaderMeta[];
  section: { href: string; label: string };
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <section className="tour-header" aria-labelledby="tour-title">
      <div className="container tour-header-inner">
        <nav aria-label={dict.tour.breadcrumbs}>
          <ol className="tour-header-crumbs">
            <li className="tour-header-crumb">
              <Link href={`/${locale}`} className="tour-header-crumb-link">
                {dict.nav.home}
              </Link>
              <span aria-hidden="true">/</span>
            </li>
            <li className="tour-header-crumb">
              <Link href={section.href} className="tour-header-crumb-link">
                {section.label}
              </Link>
              <span aria-hidden="true">/</span>
            </li>
            <li className="tour-header-crumb" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>
        {kicker && <p className="tour-header-kicker">{kicker}</p>}
        <h1 id="tour-title" className="tour-header-title">
          {title}
        </h1>
        {meta.length > 0 && (
          <ul className="tour-header-meta">
            {meta.map((item) => (
              <li key={item.text} className="tour-header-meta-item">
                {item.icon && <Icon name={item.icon} size={16} />}
                {item.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
