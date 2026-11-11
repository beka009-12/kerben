import type { Tour } from "@/types/tour";

export interface SearchItem {
  slug: string;
  title: string;
  place: string;
  country: string;
  image: string;
  price: number;
  days: number;
  text: string;
}

export function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ё/g, "е")
    .replace(/[-–—_/.,!?«»"'()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toSearchItem(tour: Tour): SearchItem {
  return {
    slug: tour.slug,
    title: tour.title,
    place: tour.place,
    country: tour.country,
    image: tour.image,
    price: tour.price,
    days: tour.days,
    text: normalize([tour.title, tour.place, tour.country, tour.summary, ...tour.itinerary.map((s) => s.title)].join(" ")),
  };
}

export function searchTours(items: SearchItem[], query: string, limit = 8): SearchItem[] {
  const words = normalize(query).split(" ").filter(Boolean);
  if (words.length === 0) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    if (!words.every((word) => item.text.includes(word))) continue;
    const head = normalize(`${item.title} ${item.place}`);
    let score = 0;
    for (const word of words) {
      if (head.startsWith(word) || head.includes(` ${word}`)) score += 3;
      else if (head.includes(word)) score += 2;
      else score += 1;
    }
    scored.push({ item, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
