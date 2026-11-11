"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { EmptyOffers } from "@/components/common/empty-offers/EmptyOffers";
import { CatalogCard } from "@/components/tours/catalog-card/CatalogCard";
import { SortMenu } from "@/components/tours/sort-menu/SortMenu";
import { ToursFilters } from "@/components/tours/tours-filters/ToursFilters";
import { ButtonLink } from "@/components/ui/button/Button";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { ROW_THEMES, SORTS, type SortKey, type Theme } from "@/utils/tour-filters";
import type { Tour } from "@/types/tour";
import { useToursCatalog } from "@/utils/tours/use-tours-catalog";
import "./tours-catalog.css";

const MemoCard = memo(CatalogCard);

const THEME_ICONS: Record<Theme, IconName> = { mountain: "mountain", lake: "waves", nomad: "home", adventure: "compass", history: "landmark", winter: "mountain" };

export const TOURS_HERO = "/images/tours/tours-hero-v2.webp";

export function ToursCatalog({ tours }: { tours: Tour[] }) {
  const { locale, dict, t, filters, ceiling, themeEmpty, results, visible, more, showMore, themeTitle, update, toggle, setPrice, reset, filtered, countLabel, resultsRef, filtersOpen, openFilters, closeFilters } =
    useToursCatalog({ tours });
  const labels = { from: dict.card.from, perPerson: dict.card.perPerson, more: dict.card.more, durations: t.durations, days: dict.card.days };

  const filtersPanel = (
    <ToursFilters t={t} locale={locale} filters={filters} ceiling={ceiling} onPrice={setPrice} onToggle={toggle} onReset={reset} />
  );

  const hero = (
    <section className="tours-catalog-hero" aria-labelledby="tours-title">
      <Image src={TOURS_HERO} alt="" fill priority quality={85} sizes="100vw" className="tours-catalog-hero-image" />
      <div className="tours-catalog-hero-shade" aria-hidden="true" />
      <div className="tours-catalog-hero-inner">
        <h1 id="tours-title" className="tours-catalog-hero-title">
          {t.heroTitle}
        </h1>
        <p className="tours-catalog-hero-text">{t.heroText}</p>
      </div>
    </section>
  );

  if (tours.length === 0) {
    return (
      <div className="tours-catalog">
        {hero}
        <div className="tours-catalog-none">
          <EmptyOffers
            icon="route"
            title={dict.offers.emptyTitle}
            text={dict.offers.emptyText}
            action={
              <ButtonLink href={`/${locale}/chat`} size="lg">
                <Icon name="sparkles" size={18} />
                {dict.offers.request}
              </ButtonLink>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tours-catalog">
      {hero}

      <div className="tours-catalog-themes" role="group" aria-label={t.themes}>
        {(["all", ...ROW_THEMES] as const).map((theme) => (
          <button
            key={theme}
            type="button"
            className={filters.theme === theme ? "tours-catalog-theme tours-catalog-theme-active" : "tours-catalog-theme"}
            aria-pressed={filters.theme === theme}
            onClick={() => update("theme", theme)}
          >
            {theme !== "all" && <Icon name={THEME_ICONS[theme]} size={20} />}
            {theme === "all" ? t.themeAll : themeTitle(theme)}
          </button>
        ))}
      </div>

      <div className="tours-catalog-layout">
        <aside className="tours-catalog-aside" aria-label={t.filters}>
          {filtersPanel}
        </aside>

        {filtersOpen && (
          <div className="tours-catalog-sheet" role="dialog" aria-modal="true" aria-label={t.filters}>
            <button type="button" className="tours-catalog-sheet-backdrop" aria-label={t.close} onClick={closeFilters} />
            <div className="tours-catalog-sheet-panel">
              <button type="button" className="tours-catalog-sheet-close" aria-label={t.close} onClick={closeFilters}>
                <Icon name="close" size={20} />
              </button>
              {filtersPanel}
              <button type="button" className="tours-catalog-sheet-apply" onClick={closeFilters}>
                {t.showResults} · {results.length}
              </button>
            </div>
          </div>
        )}

        <div ref={resultsRef} className="tours-catalog-results">
          <div className="tours-catalog-bar">
            <h2 className="tours-catalog-count" role="status">
              {results.length} {countLabel}
            </h2>
            <div className="tours-catalog-tools">
              <button type="button" className="tours-catalog-open" onClick={openFilters} aria-haspopup="dialog">
                <Icon name="sliders" size={18} />
                {t.filters}
                {filtered && <span className="tours-catalog-open-dot" aria-hidden="true" />}
              </button>
              <SortMenu label={t.sort} options={SORTS} labels={t.sorts} value={filters.sort} onChange={(sort: SortKey) => update("sort", sort)} />
            </div>
          </div>

          {themeEmpty && filters.theme !== "all" && (
            <div className="tours-catalog-notice" role="status">
              <Icon name="compass" size={20} />
              <span className="tours-catalog-notice-text">{t.themeEmpty.replace("{theme}", themeTitle(filters.theme))}</span>
              <Link href={`/${locale}/chat?ask=${encodeURIComponent(themeTitle(filters.theme))}`} className="tours-catalog-notice-link">
                {t.themeAsk}
              </Link>
            </div>
          )}

          {visible.length > 0 ? (
            <>
              <ul className="tours-catalog-grid">
                {visible.map((tour, index) => (
                  <li key={tour.slug} className="tours-catalog-item">
                    <MemoCard tour={tour} locale={locale} labels={labels} eager={index < 3} />
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
      </div>
    </div>
  );
}
