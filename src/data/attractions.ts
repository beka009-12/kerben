import type { Dictionary } from "@/utils/i18n/dictionaries";

export type AttractionSlug = keyof Dictionary["attractions"]["items"];

export interface Attraction {
  slug: AttractionSlug;
  /** Без фото место показывается типографской плашкой — пока не пришлют снимок */
  image?: string;
  /** Вертикальный кадр: башня Бураны и ели Ала-Арчи теряются при широком кадрировании */
  portrait?: boolean;
}

const photo = (name: string) => `/images/attractions/${name}.webp`;

/** Порядок — как в путеводителе */
export const ATTRACTIONS: Attraction[] = [
  { slug: "burana", image: photo("burana"), portrait: true },
  { slug: "ala-archa", image: photo("ala-archa"), portrait: true },
  { slug: "tash-rabat", image: photo("tash-rabat") },
  { slug: "sulaiman-too", image: photo("sulaiman-too") },
  { slug: "jeti-oguz", image: photo("jeti-oguz"), portrait: true },
  { slug: "altyn-arashan", image: photo("altyn-arashan") },
  { slug: "safed-bulan" },
  { slug: "manas-ordo" },
  { slug: "sary-chelek" },
];
