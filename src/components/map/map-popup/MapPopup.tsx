import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import type { MapCard } from "@/utils/map/use-map-view";
import "./map-popup.css";

export function MapPopup({ card }: { card: MapCard }) {
  return (
    <article className={card.image ? "map-popup" : "map-popup map-popup-plain"}>
      {card.image && (
        <div className="map-popup-media">
          <Image src={card.image} alt="" fill sizes="240px" className="map-popup-image" />
        </div>
      )}
      <div className="map-popup-body">
        {card.subtitle && (
          <p className="map-popup-place">
            <Icon name="mapPin" size={13} />
            {card.subtitle}
          </p>
        )}
        <h3 className="map-popup-title">{card.title}</h3>
        {card.text && <p className="map-popup-text">{card.text}</p>}
        {(card.meta || card.rating) && (
          <p className="map-popup-meta">
            {card.rating ? (
              <span className="map-popup-rating">
                <Icon name="star" size={13} filled />
                {card.rating.toFixed(1)}
              </span>
            ) : null}
            {card.meta && (
              <span className="map-popup-days">
                <Icon name="clock" size={13} />
                {card.meta}
              </span>
            )}
          </p>
        )}
        {(card.price || card.href) && (
          <div className="map-popup-footer">
            {card.price && <strong className="map-popup-price">{card.price}</strong>}
            {card.href && (
              <Link href={card.href} className="map-popup-link">
                {card.cta}
                <Icon name="arrowRight" size={14} />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
