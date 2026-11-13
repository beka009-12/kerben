import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./hero.css";

export function Hero({ image, locale, dict }: { image: string; locale: Locale; dict: Dictionary }) {
  const t = dict.hero;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container-wide">
        <div className="hero-card">
          <Image src={image} alt="" fill preload quality={85} sizes="(min-width: 1440px) 1360px, 100vw" className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-kicker">{t.eyebrow}</p>
              <h1 id="hero-title" className="hero-title">
                {t.title}
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
        </div>
      </div>
    </section>
  );
}
