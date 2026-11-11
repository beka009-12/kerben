import type { Theme } from "@/utils/tour-filters";
import { kg, pagePhoto, photos } from "./images";

export const EXPERIENCES: { image: string; theme: Theme }[] = [
  { image: pagePhoto("ala-archa-gorge-hd"), theme: "mountain" },
  { image: pagePhoto("lake-peaks-hd"), theme: "lake" },
  { image: kg("song-kul-yurts"), theme: "nomad" },
  { image: kg("horses"), theme: "adventure" },
  { image: photos.oldStreet, theme: "history" },
  { image: kg("song-kul-peaks"), theme: "winter" },
];
