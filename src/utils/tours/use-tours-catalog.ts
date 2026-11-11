"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/utils/hooks/useDebouncedValue";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { defaultFilters, filterTours, filtersToParams, readFilters, THEMES, type Theme, type TourFilters } from "@/utils/tour-filters";
import type { Tour } from "@/types/tour";

/** Сколько карточек показываем сразу и сколько добавляет «Показать ещё» */
export const PAGE_SIZE = 9;

/** Верхняя граница ползунка цены: 500 $, если все туры дешевле, иначе 1000 $ (или следующие 500 $ сверху) */
export function priceCeiling(tours: Tour[]): number {
  const max = Math.max(0, ...tours.map((tour) => tour.price));
  return Math.max(500, Math.ceil(max / 500) * 500);
}

export function useToursCatalog({ tours }: { tours: Tour[] }) {
  const { locale, dict } = useI18n();
  const t = dict.tours;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<TourFilters>(() => readFilters(new URLSearchParams(searchParams)));
  const [shown, setShown] = useState(PAGE_SIZE);
  const query = useDebouncedValue(filters.query, 250);
  const resultsRef = useRef<HTMLDivElement>(null);

  const ceiling = useMemo(() => priceCeiling(tours), [tours]);

  const matched = useMemo(() => filterTours(tours, { ...filters, query }), [tours, filters, query]);
  const themeEmpty = filters.theme !== "all" && matched.length === 0;
  const withoutTheme = useMemo(
    () => (themeEmpty ? filterTours(tours, { ...filters, query, theme: "all" }) : []),
    [themeEmpty, tours, filters, query],
  );
  const results = themeEmpty ? withoutTheme : matched;
  const visible = results.slice(0, shown);
  const themeTitle = (theme: Theme) => dict.home.experiences.items[THEMES.indexOf(theme)]?.title ?? theme;

  useEffect(() => {
    const params = filtersToParams({ ...filters, query });
    const next = params.toString() ? `${pathname}?${params}` : pathname;
    if (next !== `${pathname}${window.location.search}`) router.replace(next, { scroll: false });
  }, [filters, query, pathname, router]);

  const update = useCallback(<K extends keyof TourFilters>(key: K, value: TourFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setShown(PAGE_SIZE);
  }, []);

  /** Отметить/снять значение в списке (длительность, формат) */
  const toggle = useCallback(<K extends "durations" | "formats">(key: K, value: TourFilters[K][number]) => {
    setFilters((prev) => {
      const list = prev[key] as string[];
      return { ...prev, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] };
    });
    setShown(PAGE_SIZE);
  }, []);

  const setPrice = useCallback(
    (min: number, max: number) => {
      setFilters((prev) => ({ ...prev, minPrice: min > 0 ? min : 0, maxPrice: max < ceiling ? max : 0 }));
      setShown(PAGE_SIZE);
    },
    [ceiling],
  );

  const reset = useCallback(() => {
    setFilters(defaultFilters);
    setShown(PAGE_SIZE);
  }, []);

  const filtered = filtersToParams({ ...filters, sort: "popular" }).toString() !== "";
  const countLabel = useMemo(() => {
    const form = new Intl.PluralRules(locale).select(results.length) as keyof typeof t.countForms;
    return t.countForms[form] ?? t.countForms.other;
  }, [locale, results.length, t]);

  // На телефоне и планшете фильтры открываются отдельной панелью по кнопке
  const [filtersOpen, setFiltersOpen] = useState(false);
  const openFilters = useCallback(() => setFiltersOpen(true), []);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  return {
    locale,
    dict,
    t,
    filters,
    ceiling,
    themeEmpty,
    results,
    visible,
    more: results.length > visible.length,
    showMore: () => setShown((n) => n + PAGE_SIZE),
    themeTitle,
    update,
    toggle,
    setPrice,
    reset,
    filtered,
    countLabel,
    resultsRef,
    filtersOpen,
    openFilters,
    closeFilters,
  };
}
