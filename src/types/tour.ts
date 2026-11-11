export type LngLat = [number, number];

export type TourCategory = "nature" | "beach" | "culture" | "adventure" | "luxury" | "family";
export type Difficulty = "easy" | "moderate" | "hard";
export type Region = "asia" | "europe" | "africa" | "northAmerica" | "southAmerica" | "oceania";

export interface Tour {
  id: number | null;
  slug: string;
  place: string;
  title: string;
  country: string;
  summary: string;
  overview: string;
  region: Region;
  coords: LngLat;
  point?: LngLat | null;
  image: string;
  gallery: string[];
  price: number;
  rating: number;
  reviews: number;
  days: number;
  nights?: number | null;
  groupSize: string;
  difficulty: Difficulty | null;
  languages: string[];
  category: TourCategory;
  categoryName?: string;
  tourType?: string;
  badge: "bestseller" | "new" | null;
  highlights: { title: string; text: string; image: string }[];
  itinerary: { day: string; title: string; text: string; coords: LngLat }[];
  included: string[];
  excluded: string[];
}
