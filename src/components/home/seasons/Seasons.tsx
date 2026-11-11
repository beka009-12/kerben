import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { SEASON_ICONS } from "@/utils/home/season-icons";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./seasons.css";

export function Seasons({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.seasons;
  return (
    <section className="seasons" aria-labelledby="seasons-title">
      <div className="container">
        <div className="seasons-head">
          <div className="seasons-head-copy">
            <p className="seasons-kicker">{t.kicker}</p>
            <h2 id="seasons-title" className="seasons-title">
              {t.title}
            </h2>
          </div>
          <Link href={`/${locale}/chat?ask=${encodeURIComponent(t.ask)}`} className="seasons-link">
            {t.cta}
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        <ol className="seasons-list">
          {t.items.map((season, i) => (
            <li key={season.months} className="seasons-card">
              <span className="seasons-icon">
                <Icon name={SEASON_ICONS[i % SEASON_ICONS.length]} size={22} />
              </span>
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
