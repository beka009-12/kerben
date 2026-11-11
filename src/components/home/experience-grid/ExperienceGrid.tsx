import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./experience-grid.css";

export function ExperienceGrid({
  images,
  themes,
  locale,
  dict,
}: {
  images: string[];
  themes: string[];
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.home.experiences;
  return (
    <section id="experiences" className="experience-grid" aria-labelledby="experiences-title">
      <div className="container">
        <p className="experience-grid-kicker">{t.kicker}</p>
        <h2 id="experiences-title" className="experience-grid-title">
          {t.title}
        </h2>
        <ul className="experience-grid-list">
          {t.items.map((item, i) => (
            <li key={item.title} className={i < 2 ? "experience-grid-item experience-grid-item-wide" : "experience-grid-item"}>
              <Link href={`/${locale}/experiences/${themes[i] ?? ""}`} className="experience-grid-card">
                <Image
                  src={images[i % images.length]}
                  alt=""
                  fill
                  sizes="(min-width: 900px) 50vw, 100vw"
                  className="experience-grid-image"
                />
                <span className="experience-grid-shade" />
                <span className="experience-grid-body">
                  <span className="experience-grid-number">{String(i + 1).padStart(2, "0")}</span>
                  <span className="experience-grid-name">{item.title}</span>
                  <span className="experience-grid-text">{item.text}</span>
                  <span className="experience-grid-cta">
                    {item.cta}
                    <Icon name="arrowRight" size={16} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
