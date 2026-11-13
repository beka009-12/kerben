import type { ReactNode } from "react";
import { EmptyOffers } from "@/components/common/empty-offers/EmptyOffers";
import { ListingGrid, type ListingGridItem, type ListingGridLabels } from "@/components/common/listing-grid/ListingGrid";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { ButtonLink } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./listing-page.css";

export function ListingPage({
  hero,
  items,
  labels,
  filters = true,
  locale,
  dict,
  children,
}: {
  hero: { kicker?: string; title: string; text?: string; image: string };
  items: ListingGridItem[];
  labels: ListingGridLabels;
  filters?: boolean;
  locale: Locale;
  dict: Dictionary;
  children?: ReactNode;
}) {
  return (
    <>
      <PageHero kicker={hero.kicker} title={hero.title} text={hero.text} image={hero.image} />
      <section className="listing-page" aria-label={hero.title}>
        <div className="container">
          {items.length === 0 ? (
            <EmptyOffers
              title={dict.offers.emptyTitle}
              text={dict.offers.emptyText}
              action={
                <ButtonLink href={`/${locale}/chat`} size="lg">
                  {dict.offers.request}
                  <Icon name="arrowRight" size={18} />
                </ButtonLink>
              }
            />
          ) : (
            <ListingGrid items={items} labels={labels} filters={filters} />
          )}
          {children}
        </div>
      </section>
    </>
  );
}
