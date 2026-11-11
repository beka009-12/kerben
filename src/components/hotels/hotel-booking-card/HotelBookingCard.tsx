import { PickButton } from "@/components/ui/pick-button/PickButton";
import { hotelPick } from "@/utils/trip/trip-picks";
import { Icon } from "@/components/ui/icon/Icon";
import type { HotelItem } from "@/utils/api/catalog";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./hotel-booking-card.css";

export function HotelBookingCard({ hotel, locale, dict }: { hotel: HotelItem; locale: Locale; dict: Dictionary }) {
  const t = dict.hotels;

  return (
    <aside className="hotel-booking">
      <div className="hotel-booking-head">
        {hotel.price > 0 ? (
          <p className="hotel-booking-price">
            <span className="hotel-booking-from">{dict.card.from}</span>
            <strong className="hotel-booking-amount">{formatPrice(hotel.price, locale)}</strong>
            <span className="hotel-booking-unit">/ {dict.units[hotel.unit] ?? t.perNight}</span>
          </p>
        ) : (
          <p className="hotel-booking-amount">{t.free}</p>
        )}
      </div>

      <PickButton pick={hotelPick(hotel, locale, dict.units)} size="lg" block needsTour />

      <ul className="hotel-booking-points">
        <li className="hotel-booking-point">
          <Icon name="shield" size={18} />
          {t.noPay}
        </li>
        <li className="hotel-booking-point">
          <Icon name="clock" size={18} />
          {t.reply}
        </li>
      </ul>
    </aside>
  );
}
