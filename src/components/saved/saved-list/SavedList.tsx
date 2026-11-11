"use client";

import Image from "next/image";
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
      <div className="saved-list-empty">
        <Image src="/images/saved/empty-camel.webp" alt="" width={514} height={503} sizes="280px" className="saved-list-empty-art" priority />
        <h2 className="saved-list-empty-title">{dict.saved.emptyTitle}</h2>
        <p className="saved-list-empty-text">{dict.saved.empty}</p>
        <ButtonLink href={`/${locale}/tours`}>
          <Icon name="route" size={18} />
          {dict.saved.browse}
        </ButtonLink>
      </div>
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
