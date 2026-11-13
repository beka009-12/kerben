import { DestinationCard } from "@/components/home/destination-card/DestinationCard";
import type { Locale } from "@/utils/i18n/config";
import type { TourCardDict } from "@/utils/tours/tour-card";
import type { Tour } from "@/types/tour";

export function TourCard({ tour, locale, dict, eager = false }: { tour: Tour; locale: Locale; dict: TourCardDict; eager?: boolean }) {
  return (
    <DestinationCard
      tour={tour}
      locale={locale}
      fromLabel={dict.card.from}
      daysLabel={dict.card.days}
      oneDayLabel={dict.card.oneDay}
      perLabel={dict.card.perPerson}
      categoryLabel={tour.categoryName ?? dict.categories.items[tour.category]?.title}
      eager={eager}
    />
  );
}
