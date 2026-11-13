import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { SectionHeader } from "@/components/ui/section-header/SectionHeader";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./seasons.css";

export function Seasons({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.seasons;
  return (
    <section className="seasons" aria-labelledby="seasons-title">
      <div className="container">
        <SectionHeader
          id="seasons-title"
          kicker={t.kicker}
          title={t.title}
          action={
            <Link href={`/${locale}/chat?ask=${encodeURIComponent(t.ask)}`} className="seasons-link">
              {t.cta}
              <Icon name="arrowRight" size={18} />
            </Link>
          }
        />
        <ol className="seasons-list">
          {t.items.map((season) => (
            <li key={season.months} className="seasons-card">
              <p className="seasons-months">{season.months}</p>
              <h3 className="seasons-name">{season.title}</h3>
              <p className="seasons-text">{season.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
