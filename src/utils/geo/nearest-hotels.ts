import type { HotelItem } from "@/utils/api/catalog";
import type { LngLat } from "@/types/tour";

export function distanceKm([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestHotels(hotels: HotelItem[], point: LngLat | null | undefined, count = 20) {
  if (!point) return hotels.slice(0, count).map((hotel) => ({ hotel, km: null as number | null }));
  return hotels
    .map((hotel) => ({ hotel, km: hotel.coords ? distanceKm(point, hotel.coords) : null }))
    .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity))
    .slice(0, count);
}
