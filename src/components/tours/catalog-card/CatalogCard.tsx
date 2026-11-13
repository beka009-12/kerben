import Image from "next/image";
import { GateLink } from "@/components/ui/gate-link/GateLink";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import { durationOf, formatOf, maxGroup, tourLocation } from "@/utils/tour-filters";
import type { Tour } from "@/types/tour";
import "./catalog-card.css";

export interface CatalogCardLabels {
  from: string;
  perPerson: string;
  details: string;
  days: string;
  durations: Record<"one" | "short" | "long", string>;
  formats: Record<"individual" | "group", string>;
  groupUpTo: string;
}

function facts(tour: Tour, labels: CatalogCardLabels): string[] {
  const list = [labels.formats[formatOf(tour)]];
  const size = maxGroup(tour.groupSize ?? "");
  if (Number.isFinite(size) && size > 1) list.push(labels.groupUpTo.replace("{n}", String(size)));
  return list;
}

export function CatalogCard({ tour, locale, labels, eager = false }: { tour: Tour; locale: Locale; labels: CatalogCardLabels; eager?: boolean }) {
  const href = `/${locale}/tours/${tour.slug}`;
  const duration = durationOf(tour.days) === "one" ? labels.durations.one : `${tour.days} ${labels.days}`;

  return (
    <article className="catalog-card">
      <div className="catalog-card-media">
        <Image
          src={tour.image}
          alt=""
          fill
          quality={85}
          loading={eager ? "eager" : "lazy"}
          sizes="(min-width: 900px) 340px, 100vw"
          className="catalog-card-image"
        />
        {tour.days > 0 && <span className="catalog-card-days">{duration}</span>}
      </div>

      <div className="catalog-card-body">
        <p className="catalog-card-category">{tourLocation(tour)}</p>
        <h3 className="catalog-card-title">
          <GateLink href={href} title={tour.title} image={tour.image} className="catalog-card-link">
            {tour.place}
          </GateLink>
        </h3>
        {tour.summary && <p className="catalog-card-text">{tour.summary}</p>}
        <span className="catalog-card-spacer" />
        <ul className="catalog-card-facts">
          {facts(tour, labels).map((fact) => (
            <li key={fact} className="catalog-card-fact">
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <div className="catalog-card-aside">
        {tour.price > 0 && (
          <p className="catalog-card-price">
            <span className="catalog-card-unit">{labels.from}</span>
            <strong className="catalog-card-amount">{formatPrice(tour.price, locale)}</strong>
            <span className="catalog-card-unit">{labels.perPerson}</span>
          </p>
        )}
        <span className="catalog-card-button" aria-hidden="true">
          {labels.details}
        </span>
      </div>
    </article>
  );
}
