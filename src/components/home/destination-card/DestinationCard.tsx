import { ListingCard } from "@/components/common/listing-card/ListingCard";
import { FavoriteButton } from "@/components/ui/favorite-button/FavoriteButton";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Tour } from "@/types/tour";

export function DestinationCard({
  tour,
  locale,
  fromLabel,
  daysLabel,
  oneDayLabel,
  perLabel,
  categoryLabel,
  eager = false,
}: {
  tour: Tour;
  locale: Locale;
  fromLabel: string;
  daysLabel?: string;
  oneDayLabel?: string;
  perLabel?: string;
  categoryLabel?: string;
  eager?: boolean;
}) {
  const days = tour.days > 0 && daysLabel ? (tour.days === 1 && oneDayLabel ? oneDayLabel : `${tour.days} ${daysLabel}`) : null;

  return (
    <ListingCard
      href={`/${locale}/tours/${tour.slug}`}
      title={tour.place}
      image={tour.image}
      tag={categoryLabel}
      meta={days ? { icon: "clock", text: days } : undefined}
      price={tour.price > 0 ? { from: fromLabel, amount: formatPrice(tour.price, locale), per: perLabel } : undefined}
      eager={eager}
      action={<FavoriteButton slug={tour.slug} title={tour.place} dark />}
    />
  );
}
