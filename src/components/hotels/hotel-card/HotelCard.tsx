import { ListingCard } from "@/components/common/listing-card/ListingCard";
import type { HotelItem } from "@/utils/api/catalog";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";

export function HotelCard({ hotel, locale, dict, sizes }: { hotel: HotelItem; locale: Locale; dict: Dictionary; sizes?: string }) {
  return (
    <ListingCard
      href={`/${locale}/hotels/${hotel.id}`}
      title={hotel.name}
      image={hotel.image}
      tag={dict.hotels.tag}
      meta={hotel.location ? { icon: "mapPin", text: hotel.location } : undefined}
      price={hotel.price > 0 ? { from: dict.card.from, amount: formatPrice(hotel.price, locale), per: dict.units[hotel.unit] ?? dict.hotels.perNight } : undefined}
      sizes={sizes}
    />
  );
}
