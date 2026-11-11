import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import type { PriceUnit } from "@/utils/api/backend";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./offer-booking-card.css";

export function OfferBookingCard({
  price,
  unit,
  badge,
  askPrompt,
  locale,
  dict,
}: {
  price: number;
  unit: PriceUnit;
  badge?: ReactNode;
  askPrompt: string;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <aside className="offer-booking">
      <div className="offer-booking-head">
        {price > 0 ? (
          <p className="offer-booking-price">
            <span className="offer-booking-from">{dict.card.from}</span>
            <strong className="offer-booking-amount">{formatPrice(price, locale)}</strong>
            <span className="offer-booking-unit">/ {dict.units[unit]}</span>
          </p>
        ) : (
          <p className="offer-booking-amount">{dict.hotels.free}</p>
        )}
        {badge && <span className="offer-booking-stars">{badge}</span>}
      </div>

      <ul className="offer-booking-points">
        <li className="offer-booking-point">
          <Icon name="shield" size={18} />
          {dict.hotels.noPay}
        </li>
        <li className="offer-booking-point">
          <Icon name="clock" size={18} />
          {dict.hotels.reply}
        </li>
      </ul>

      <div className="offer-booking-actions">
        <Link href={`/${locale}/chat?ask=${encodeURIComponent(askPrompt)}`} className="offer-booking-action offer-booking-action-ai">
          <Icon name="chat" size={18} />
          {dict.hotels.askAi}
        </Link>
      </div>
    </aside>
  );
}
