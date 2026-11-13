import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { SectionHeader } from "@/components/ui/section-header/SectionHeader";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./experience-grid.css";

type TileSize = "feature" | "compact" | "tall" | "wide";

interface Tile {
  area: string;
  size: TileSize;
}

/*
 * Мозаика по порядку items в словаре (desktop, 4 колонки):
 *   a a b c
 *   a a d e
 *   f f f e
 * «История» (e) — вертикальная: у её фото портретная ориентация.
 */
const TILES: readonly Tile[] = [
  { area: "a", size: "feature" },
  { area: "b", size: "compact" },
  { area: "c", size: "compact" },
  { area: "d", size: "compact" },
  { area: "e", size: "tall" },
  { area: "f", size: "wide" },
];

const SIZES: Record<TileSize, string> = {
  feature: "(min-width: 1024px) 640px, 100vw",
  compact: "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw",
  tall: "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw",
  wide: "(min-width: 1024px) 960px, (min-width: 640px) 50vw, 100vw",
};

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
        <SectionHeader id="experiences-title" kicker={t.kicker} title={t.title} />
        <ul className="experience-grid-list">
          {t.items.map((item, i) => {
            const tile = TILES[i] ?? { area: "", size: "compact" };
            return (
              <li key={item.title} className={tile.area ? `experience-grid-item experience-grid-item-${tile.area}` : "experience-grid-item"}>
                <Link href={`/${locale}/experiences/${themes[i] ?? ""}`} className={`experience-grid-card experience-grid-card-${tile.size}`}>
                  <Image src={images[i % images.length]} alt="" fill sizes={SIZES[tile.size]} className="experience-grid-image" />
                  <span className="experience-grid-shade" />
                  <span className="experience-grid-body">
                    <span className="experience-grid-name">{item.title}</span>
                    <span className="experience-grid-cta">
                      {item.cta}
                      <Icon name="arrowRight" size={18} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
