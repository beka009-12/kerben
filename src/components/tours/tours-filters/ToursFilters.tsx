"use client";

import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { DURATIONS, FORMATS, type DurationKey, type FormatKey, type TourFilters } from "@/utils/tour-filters";
import "./tours-filters.css";

const STEP = 10;

export function ToursFilters({
  t,
  locale,
  filters,
  ceiling,
  onPrice,
  onToggle,
  onReset,
}: {
  t: Dictionary["tours"];
  locale: Locale;
  filters: TourFilters;
  ceiling: number;
  onPrice: (min: number, max: number) => void;
  onToggle: <K extends "durations" | "formats">(key: K, value: TourFilters[K][number]) => void;
  onReset: () => void;
}) {
  const max = filters.maxPrice || ceiling;
  const range = { "--from": "0%", "--to": `${(max / ceiling) * 100}%` } as CSSProperties;

  return (
    <div className="tours-filters">
      <div className="tours-filters-head">
        <h2 className="tours-filters-title">{t.filters}</h2>
        <button type="button" className="tours-filters-reset" onClick={onReset}>
          <Icon name="refresh" size={16} />
          {t.resetAll}
        </button>
      </div>

      <fieldset className="tours-filters-group">
        <legend className="tours-filters-legend">{t.pricePerPerson}</legend>
        <div className="tours-filters-range" style={range}>
          <input
            type="range"
            min={0}
            max={ceiling}
            step={STEP}
            value={max}
            aria-label={t.priceMax}
            aria-valuetext={formatPrice(max, locale)}
            onChange={(event) => onPrice(0, Math.max(Number(event.target.value), STEP))}
            className="tours-filters-thumb"
          />
        </div>
        <p className="tours-filters-prices">
          <span>{formatPrice(0, locale)}</span>
          <span className="tours-filters-price-max">{formatPrice(max, locale)}</span>
        </p>
      </fieldset>

      <fieldset className="tours-filters-group">
        <legend className="tours-filters-legend">{t.duration}</legend>
        {DURATIONS.map((key: DurationKey) => (
          <label key={key} className="tours-filters-check">
            <input type="checkbox" checked={filters.durations.includes(key)} onChange={() => onToggle("durations", key)} />
            {t.durations[key]}
          </label>
        ))}
      </fieldset>

      <fieldset className="tours-filters-group">
        <legend className="tours-filters-legend">{t.format}</legend>
        {FORMATS.map((key: FormatKey) => (
          <label key={key} className="tours-filters-check">
            <input type="checkbox" checked={filters.formats.includes(key)} onChange={() => onToggle("formats", key)} />
            {t.formats[key]}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
