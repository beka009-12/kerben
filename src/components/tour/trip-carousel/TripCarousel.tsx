"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { PickButton } from "@/components/ui/pick-button/PickButton";
import type { TripOffer } from "@/utils/trip/trip-offers";
import type { TripPick } from "@/utils/trip/trip-store";
import { useTripCarousel } from "@/utils/trip/use-trip-carousel";
import "./trip-carousel.css";

export function TripCarousel({ offers, tour, scrollTo = "trip" }: { offers: TripOffer[]; tour: TripPick; scrollTo?: string }) {
  const { dict, ref, atStart, atEnd, onScroll, prev, next, scrollable, total } = useTripCarousel(offers.length);

  return (
    <div className="trip-carousel">
      <div className="trip-carousel-top">
        <p className="trip-carousel-total">{total}</p>
        {scrollable && (
          <div className="trip-carousel-nav">
            <span className="trip-carousel-hint">{dict.trip.swipe}</span>
            <button type="button" className="trip-carousel-arrow" onClick={prev} disabled={atStart} aria-label={dict.trip.prev}>
              <Icon name="chevronLeft" size={20} />
            </button>
            <button type="button" className="trip-carousel-arrow" onClick={next} disabled={atEnd} aria-label={dict.trip.next}>
              <Icon name="chevronRight" size={20} />
            </button>
          </div>
        )}
      </div>

      <div className={atEnd ? "trip-carousel-viewport" : "trip-carousel-viewport trip-carousel-viewport-more"}>
        <div ref={ref} className="trip-carousel-track" onScroll={onScroll}>
          {offers.map((offer) => (
            <article key={offer.pick.key} className="trip-carousel-card">
              <Link href={offer.href} className="trip-carousel-media" tabIndex={-1} aria-hidden="true">
                <Image src={offer.image} alt="" fill sizes="(min-width: 1024px) 320px, 78vw" className="trip-carousel-image" />
                {offer.badge && <span className="trip-carousel-badge">{offer.badge}</span>}
              </Link>
              <div className="trip-carousel-body">
                <h3 className="trip-carousel-title">
                  <Link href={offer.href} className="trip-carousel-link">
                    {offer.title}
                  </Link>
                </h3>
                <p className="trip-carousel-text">{offer.text}</p>
                <div className="trip-carousel-foot">
                  {offer.price ? <p className="trip-carousel-price">{offer.price}</p> : <span />}
                  <PickButton pick={offer.pick} scrollTo={scrollTo} tour={tour} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
