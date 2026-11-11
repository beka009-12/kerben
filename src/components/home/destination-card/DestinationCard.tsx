import Image from "next/image";
import { FavoriteButton } from "@/components/ui/favorite-button/FavoriteButton";
import { GateLink } from "@/components/ui/gate-link/GateLink";
import { Icon } from "@/components/ui/icon/Icon";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Tour } from "@/types/tour";
import "./destination-card.css";

export function DestinationCard({
  tour,
  locale,
  fromLabel,
  daysLabel,
  perLabel,
  categoryLabel,
  eager = false,
}: {
  tour: Tour;
  locale: Locale;
  fromLabel: string;
  daysLabel?: string;
  perLabel?: string;
  categoryLabel?: string;
  eager?: boolean;
}) {
  const href = `/${locale}/tours/${tour.slug}`;
  return (
    <article className="destination-card">
      <div className="destination-card-media">
        <Image
          src={tour.image}
          alt=""
          fill
          quality={85}
          loading={eager ? "eager" : "lazy"}
          sizes="(min-width: 1100px) 33vw, 50vw"
          className="destination-card-image"
        />
        <span className="destination-card-shade" />
        {categoryLabel && <span className="destination-card-tag">{categoryLabel}</span>}
        <span className="destination-card-fav">
          <FavoriteButton slug={tour.slug} title={tour.place} dark />
        </span>
        <span className="destination-card-chips">
          {tour.reviews > 0 && (
            <span className="destination-card-chip">
              <Icon name="star" size={12} filled className="destination-card-star" />
              {tour.rating.toFixed(1)}
            </span>
          )}
          {daysLabel && tour.days > 0 && (
            <span className="destination-card-chip">
              <Icon name="clock" size={12} />
              {tour.days} {daysLabel}
            </span>
          )}
        </span>
      </div>

      <div className="destination-card-body">
        <h3 className="destination-card-title">
          <GateLink href={href} title={tour.title} image={tour.image} className="destination-card-link">
            {tour.place}
          </GateLink>
        </h3>
        <p className="destination-card-price">
          <span className="destination-card-from">{fromLabel}</span>
          <strong className="destination-card-amount">{formatPrice(tour.price, locale)}</strong>
          {perLabel && <span className="destination-card-per">/ {perLabel}</span>}
        </p>
      </div>
    </article>
  );
}
