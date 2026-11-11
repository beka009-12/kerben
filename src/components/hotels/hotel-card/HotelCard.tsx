import Image from "next/image";
import { GateLink } from "@/components/ui/gate-link/GateLink";
import { PickButton } from "@/components/ui/pick-button/PickButton";
import { hotelPick } from "@/utils/trip/trip-picks";
import { Icon } from "@/components/ui/icon/Icon";
import { Rating } from "@/components/ui/rating/Rating";
import type { HotelItem } from "@/utils/api/catalog";
import { AMENITY_ICONS } from "@/utils/hotels/amenity-icons";
import { formatCompact, formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./hotel-card.css";

export function HotelCard({ hotel, locale, dict }: { hotel: HotelItem; locale: Locale; dict: Dictionary }) {
  const t = dict.hotels;
  const names = t.amenities as Record<string, string>;
  const href = `/${locale}/hotels/${hotel.id}`;
  return (
    <article className="hotel-card">
      <GateLink href={href} title={hotel.name} image={hotel.image} className="hotel-card-media" tabIndex={-1} hidden>
        <Image src={hotel.image} alt="" fill sizes="(min-width: 1100px) 380px, (min-width: 640px) 50vw, 100vw" className="hotel-card-image" />      </GateLink>
      <div className="hotel-card-body">
        {hotel.location && (
          <p className="hotel-card-city">
            <Icon name="mapPin" size={14} />
            {hotel.location}
          </p>
        )}
        <h3 className="hotel-card-name">
          <GateLink href={href} title={hotel.name} image={hotel.image} className="hotel-card-link">
            {hotel.name}
          </GateLink>
        </h3>
        {hotel.amenities.length > 0 && (
          <ul className="hotel-card-amenities">
            {hotel.amenities.slice(0, 6).map((key) => (
              <li key={key} className="hotel-card-amenity">
                <Icon name={AMENITY_ICONS[key] ?? "check"} size={14} />
                {names[key] ?? key}
              </li>
            ))}
          </ul>
        )}
        <div className="hotel-card-footer">
          {hotel.reviews > 0 ? <Rating value={hotel.rating} count={formatCompact(hotel.reviews, locale)} /> : <span />}
          {hotel.price > 0 && (
            <p className="hotel-card-price">
              <strong className="hotel-card-amount">{formatPrice(hotel.price, locale)}</strong>
              <span className="hotel-card-night"> / {dict.units[hotel.unit] ?? t.perNight}</span>
            </p>
          )}
        </div>
        <PickButton pick={hotelPick(hotel, locale, dict.units)} block needsTour />
      </div>
    </article>
  );
}
