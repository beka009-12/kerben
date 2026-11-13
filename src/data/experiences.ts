import type { Theme } from "@/utils/tour-filters";

const home = (name: string) => `/images/home/${name}.webp`;

export const EXPERIENCES: { image: string; theme: Theme }[] = [
  { image: home("experience-mountains"), theme: "mountain" },
  { image: home("hero-lake"), theme: "lake" },
  { image: home("experience-culture"), theme: "nomad" },
  { image: home("experience-adventure"), theme: "adventure" },
  { image: home("experience-history"), theme: "history" },
  { image: home("experience-winter"), theme: "winter" },
];
