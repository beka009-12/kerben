import Image from "next/image";
import { FavoriteButton } from "@/components/ui/favorite-button/FavoriteButton";
import { GateLink } from "@/components/ui/gate-link/GateLink";
import { Icon } from "@/components/ui/icon/Icon";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import { durationOf, tourLocation } from "@/utils/tour-filters";
import type { Tour } from "@/types/tour";
import "./catalog-card.css";

export function CatalogCard({
  tour,
  locale,
  labels,
  eager = false,
}: {
  tour: Tour;
  locale: Locale;
  labels: { from: string; perPerson: string; more: string; durations: Record<"one" | "short" | "long", string>; days: string };
  eager?: boolean;
}) {
  const href = `/${locale}/tours/${tour.slug}`;
  const span = durationOf(tour.days);
  const duration = span === "one" ? labels.durations.one : `${tour.days} ${labels.days}`;

  return (
    <article className="catalog-card">
      <div className="catalog-card-media">
        <Image
          src={tour.image}
          alt=""
          fill
          quality={85}
          loading={eager ? "eager" : "lazy"}
          sizes="(min-width: 1180px) 360px, (min-width: 700px) 45vw, 92vw"
          className="catalog-card-image"
        />
        <span className="catalog-card-fav">
          <FavoriteButton slug={tour.slug} title={tour.place} dark />
        </span>
        {tour.days > 0 && (
          <span className="catalog-card-days">
            <Icon name="clock" size={14} />
            {duration}
          </span>
        )}
      </div>

      <div className="catalog-card-body">
        <h3 className="catalog-card-title">
          <GateLink href={href} title={tour.title} image={tour.image} className="catalog-card-link">
            {tour.place}
          </GateLink>
        </h3>
        {tour.summary && <p className="catalog-card-text">{tour.summary}</p>}
        <p className="catalog-card-place">
          <Icon name="mapPin" size={16} />
          <span className="catalog-card-place-name">{tourLocation(tour)}</span>
        </p>
        <div className="catalog-card-foot">
          <p className="catalog-card-price">
            <span className="catalog-card-from">{labels.from}</span>
            <strong className="catalog-card-amount">{formatPrice(tour.price, locale)}</strong>
            <span className="catalog-card-per">/ {labels.perPerson}</span>
          </p>
          <GateLink href={href} title={tour.title} image={tour.image} className="catalog-card-more" tabIndex={-1} hidden>
            {labels.more}
            <Icon name="arrowRight" size={16} />
          </GateLink>
        </div>
      </div>
    </article>
  );
}
