import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { HeroVideo } from "./HeroVideo";
import "./hero.css";

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.hero;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <HeroVideo pauseLabel={dict.a11y.pauseVideo} playLabel={dict.a11y.playVideo} />
      <div className="hero-shade" />
      <div className="container-wide hero-inner">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">
            <span className="hero-title-accent">{t.eyebrow}</span> {t.title}
          </h1>
          <p className="hero-text">{t.text}</p>
          <div className="hero-actions">
            <Link href={`/${locale}/tours`} className="hero-cta">
              {t.primary}
              <Icon name="arrowRight" size={18} />
            </Link>
            <Link href={`/${locale}/chat?ask=${encodeURIComponent(t.secondaryAsk)}`} className="hero-ghost">
              <Icon name="sparkle" size={18} />
              {t.secondary}
            </Link>
          </div>
        </div>
        <ul className="hero-features">
          {t.features.map((feature) => (
            <li key={feature} className="hero-feature">
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
