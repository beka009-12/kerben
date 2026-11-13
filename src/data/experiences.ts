import type { Theme } from "@/utils/tour-filters";

const home = (name: string) => `/images/home/${name}.webp`;

/** Фото озёр, приключений, истории и зимы — Wikimedia Commons, авторы и лицензии в data/credits.ts */
export const EXPERIENCES: { image: string; theme: Theme }[] = [
  { image: home("experience-mountains"), theme: "mountain" },
  { image: home("experience-lakes-kol-suu"), theme: "lake" },
  { image: home("experience-culture"), theme: "nomad" },
  { image: home("experience-adventure-ala-kul"), theme: "adventure" },
  { image: home("experience-history-burana"), theme: "history" },
  { image: home("experience-winter-ski"), theme: "winter" },
];
