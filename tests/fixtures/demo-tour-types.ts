import type { Difficulty, LngLat, Region, TourCategory } from "@/types/tour";

export interface Localized {
  en: string;
  ru: string;
  de?: string;
  zh?: string;
}

export type InclusionKey =
  | "hotel"
  | "transfers"
  | "guide"
  | "meals"
  | "tickets"
  | "insurance"
  | "flights"
  | "personal"
  | "alcohol"
  | "tips"
  | "yurt"
  | "horse"
  | "cruise"
  | "skiPass";

export interface ApiTour {
  _id?: number;
  slug: string;
  place: Localized;
  title: Localized;
  country: Localized;
  summary: Localized;
  overview: Localized;
  region: Region;
  coords: LngLat;
  image: string;
  gallery: string[];
  price: number;
  rating: number;
  reviews: number;
  days: number;
  groupSize: string;
  difficulty: Difficulty;
  languages: string[];
  category: TourCategory;
  badge: "bestseller" | "new" | null;
  highlights: { title: Localized; text: Localized; image: string }[];
  itinerary: { day: string; title: Localized; text: Localized; coords: LngLat }[];
  included: InclusionKey[];
  excluded: InclusionKey[];
}
