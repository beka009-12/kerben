"use client";

import { EmptyOffers } from "@/components/common/empty-offers/EmptyOffers";
import { TourCard } from "@/components/tours/tour-card/TourCard";
import { Button, ButtonLink } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import type { Tour } from "@/types/tour";
import { useSavedList } from "@/utils/saved/use-saved-list";
import "./saved-list.css";

export function SavedList({ tours }: { tours: Tour[] }) {
  const { locale, dict, clear, hydrated, saved } = useSavedList({ tours });

  if (!hydrated) return <div className="saved-list-skeleton" aria-busy="true" />;

  if (saved.length === 0) {
    return (
      <EmptyOffers
        icon="heart"
        title={dict.trips.emptyTitle}
        text={dict.trips.emptyText}
        action={
          <ButtonLink href={`/${locale}/tours`} size="lg">
            {dict.hero.primary}
            <Icon name="arrowRight" size={18} />
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className="saved-list">
      <ul className="saved-list-grid">
        {saved.map((tour) => (
          <li key={tour.slug}>
            <TourCard tour={tour} locale={locale} dict={dict} />
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" onClick={clear}>
        <Icon name="trash" size={16} />
        {dict.saved.clear}
      </Button>
    </div>
  );
}
