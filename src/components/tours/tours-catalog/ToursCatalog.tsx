"use client";

import Image from "next/image";
import { memo, useMemo } from "react";
import { CtaBanner, CtaBannerLink } from "@/components/common/cta-banner/CtaBanner";
import { EmptyOffers } from "@/components/common/empty-offers/EmptyOffers";
import { CatalogCard, type CatalogCardLabels } from "@/components/tours/catalog-card/CatalogCard";
import { ButtonLink } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import { DURATIONS, tourLocation, type DurationKey } from "@/utils/tour-filters";
import type { Tour } from "@/types/tour";
import { useToursCatalog } from "@/utils/tours/use-tours-catalog";
import "./tours-catalog.css";

const MemoCard = memo(CatalogCard);

export const TOURS_HERO = "/images/pages/tours-hero.webp";
export const TOURS_CTA = "/images/pages/cta-custom.webp";

export function ToursHero({ kicker, title }: { kicker: string; title: string }) {
  return (
    <section className="tours-catalog-hero" aria-labelledby="tours-title">
      <div className="container-wide">
        <div className="tours-catalog-hero-card">
          <Image src={TOURS_HERO} alt="" fill preload quality={85} sizes="(min-width: 1440px) 1360px, 100vw" className="tours-catalog-hero-image" />
          <div className="tours-catalog-hero-shade" aria-hidden="true" />
          <div className="tours-catalog-hero-inner">
            <p className="tours-catalog-hero-kicker">{kicker}</p>
            <h1 id="tours-title" className="tours-catalog-hero-title">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}

export function catalogLabels(dict: ReturnType<typeof useToursCatalog>["dict"]): CatalogCardLabels {
  const t = dict.tours;
  return {
    from: t.priceFrom,
    perPerson: dict.card.perPerson,
    details: t.details,
    days: dict.card.days,
    durations: t.durations,
    formats: t.formats,
    groupUpTo: t.groupUpTo,
  };
}

export function ToursCatalog({ tours }: { tours: Tour[] }) {
  const { locale, dict, t, filters, results, visible, more, showMore, update, reset } = useToursCatalog({ tours });
  const labels = catalogLabels(dict);
  const places = useMemo(() => [...new Set(tours.map(tourLocation).filter(Boolean))], [tours]);
  const duration = filters.durations[0] ?? "all";

  const hero = <ToursHero kicker={t.heroTitle} title={t.heroText} />;

  const cta = (
    <section className="tours-catalog-cta">
      <div className="container">
        <CtaBanner
          eyebrow={t.cta.eyebrow}
          title={t.cta.title}
          text={t.cta.text}
          image={TOURS_CTA}
          trust={t.cta.trust}
          actions={
            <>
              <CtaBannerLink href={`/${locale}/chat?ask=${encodeURIComponent(dict.home.custom.ask)}`} variant="primary">
                {t.cta.primary}
                <Icon name="arrowRight" size={18} />
              </CtaBannerLink>
              <CtaBannerLink href={`/${locale}/chat`} variant="glass">
                <Icon name="sparkle" size={18} />
                {t.cta.ask}
              </CtaBannerLink>
            </>
          }
        />
      </div>
    </section>
  );

  if (tours.length === 0) {
    return (
      <div className="tours-catalog">
        {hero}
        <div className="container tours-catalog-none">
          <EmptyOffers
            icon="route"
            title={dict.offers.emptyTitle}
            text={dict.offers.emptyText}
            action={
              <ButtonLink href={`/${locale}/chat`} size="lg">
                <Icon name="sparkle" size={18} />
                {dict.offers.request}
              </ButtonLink>
            }
          />
        </div>
        {cta}
      </div>
    );
  }

  return (
    <div className="tours-catalog">
      {hero}

      <section className="tours-catalog-main" aria-label={t.title}>
        <div className="container">
          <div className="tours-catalog-toolbar">
            <label className="tours-catalog-search">
              <Icon name="search" size={18} className="tours-catalog-search-icon" />
              <span className="visually-hidden">{t.search}</span>
              <input
                type="search"
                value={filters.query}
                onChange={(event) => update("query", event.target.value)}
                placeholder={t.searchPh}
                className="tours-catalog-search-input"
              />
            </label>

            <div className="tours-catalog-chips" role="group" aria-label={t.category}>
              {["", ...places].map((place) => (
                <button
                  key={place || "all"}
                  type="button"
                  className={filters.place === place ? "tours-catalog-chip tours-catalog-chip-active" : "tours-catalog-chip"}
                  aria-pressed={filters.place === place}
                  onClick={() => update("place", place)}
                >
                  {place || t.themeAll}
                </button>
              ))}
            </div>

            <label className="tours-catalog-duration">
              <span className="visually-hidden">{t.duration}</span>
              <select
                className="tours-catalog-duration-select"
                value={duration}
                onChange={(event) => update("durations", event.target.value === "all" ? [] : [event.target.value as DurationKey])}
              >
                <option value="all">{t.duration}</option>
                {DURATIONS.map((key) => (
                  <option key={key} value={key}>
                    {t.durations[key]}
                  </option>
                ))}
              </select>
              <Icon name="chevronDown" size={16} className="tours-catalog-duration-icon" />
            </label>
          </div>

          <p className="visually-hidden" role="status">
            {results.length}
          </p>

          {visible.length > 0 ? (
            <>
              <ul className="tours-catalog-list">
                {visible.map((tour, index) => (
                  <li key={tour.slug}>
                    <MemoCard tour={tour} locale={locale} labels={labels} eager={index < 2} />
                  </li>
                ))}
              </ul>
              {more && (
                <button type="button" className="tours-catalog-more" onClick={showMore}>
                  {t.showMore}
                  <Icon name="chevronDown" size={18} />
                </button>
              )}
            </>
          ) : (
            <div className="tours-catalog-empty">
              <Icon name="compass" size={40} />
              <p>{t.empty}</p>
              <button type="button" className="tours-catalog-more" onClick={reset}>
                {t.reset}
              </button>
            </div>
          )}
        </div>
      </section>

      {cta}
    </div>
  );
}
