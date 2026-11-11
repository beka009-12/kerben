"use client";

import Image from "next/image";
import Link from "next/link";
import { TripCarousel } from "@/components/tour/trip-carousel/TripCarousel";
import { Icon } from "@/components/ui/icon/Icon";
import { PickButton } from "@/components/ui/pick-button/PickButton";
import { useTripPlannerSection } from "@/utils/tour/use-trip-planner-section";
import type { TripOffer } from "@/utils/trip/trip-offers";
import { KIND_ICONS } from "@/utils/trip/trip-icons";
import type { TripPick } from "@/utils/trip/trip-store";
import "./trip-planner.css";

export function TripPlanner({ tour, hotels, cars }: { tour: TripPick; hotels: TripOffer[]; cars: TripOffer[] }) {
  const { dict, t, ready, step, picked, hasTour, choosing, sections, heading, kindLabels, chatHref, skip, change } = useTripPlannerSection({
    tour,
    hotels,
    cars,
  });

  return (
    <section id="trip" className="trip" aria-labelledby="trip-title">
      <div className="trip-head">
        <div className="trip-copy">
          <p className="trip-kicker">{t.tripKicker}</p>
          {heading && (
            <>
              <h2 id="trip-title" className="trip-title">
                {heading.title}
              </h2>
              {heading.text && <p className="trip-text">{heading.text}</p>}
            </>
          )}
        </div>
      </div>

      {!ready ? (
        <div className="trip-loading" aria-busy="true" />
      ) : step === "tour" ? (
        <div className="trip-start">
          {tour.image && (
            <span className="trip-start-media">
              <Image src={tour.image} alt="" fill sizes="160px" className="trip-start-image" />
            </span>
          )}
          <p className="trip-start-title">{tour.title}</p>
          <PickButton pick={tour} chooseLabel={dict.trip.chooseTour} chosenLabel={dict.trip.tourChosen} size="lg" scrollTo="trip" />
        </div>
      ) : choosing ? (
        <div className="trip-sections">
          {sections.map((section, i) => (
            <div key={section.kind} id={`trip-${section.kind}`} className="trip-section">
              {i > 0 && (
                <div className="trip-section-head">
                  <h3 className="trip-title trip-section-title">{section.title}</h3>
                </div>
              )}
              <TripCarousel offers={section.offers} tour={tour} scrollTo={section.scrollTo} />
              <div className="trip-foot">
                {!section.picked && (
                  <button type="button" className="trip-button" onClick={() => skip(section.kind)}>
                    {section.skip}
                    <Icon name="arrowRight" size={16} />
                  </button>
                )}
                <Link href={section.href} className="trip-all">
                  {section.all}
                  <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="trip-done">
          <span className="trip-done-icon" aria-hidden="true">
            <Icon name="check" size={28} />
          </span>
          <div className="trip-done-body">
            <h2 id="trip-title" className="trip-done-title">
              {t.tripDoneTitle}
            </h2>
            <p className="trip-done-text">{dict.trip.doneText}</p>
            <ul className="trip-summary">
              {picked.map((pick) => (
                <li key={pick.key} className="trip-summary-row">
                  <span className="trip-summary-photo">
                    {pick.image ? (
                      <Image src={pick.image} alt="" fill sizes="48px" className="trip-start-image" />
                    ) : (
                      <Icon name={KIND_ICONS[pick.kind]} size={18} />
                    )}
                  </span>
                  <span className="trip-summary-label">{kindLabels[pick.kind]}</span>
                  <span className="trip-summary-value">{pick.title}</span>
                  <Icon name="check" size={16} className="trip-summary-check" />
                </li>
              ))}
              {!hasTour && (
                <li className="trip-summary-row">
                  <span className="trip-summary-photo">
                    {tour.image ? <Image src={tour.image} alt="" fill sizes="48px" className="trip-start-image" /> : <Icon name="route" size={18} />}
                  </span>
                  <span className="trip-summary-label">{kindLabels.tour}</span>
                  <span className="trip-summary-value">{tour.title}</span>
                  <PickButton pick={tour} chooseLabel={dict.trip.chooseTour} chosenLabel={dict.trip.tourChosen} />
                </li>
              )}
            </ul>
            <div className="trip-done-actions">
              <Link href={chatHref} className="trip-button trip-button-primary">
                <Icon name="sparkles" size={18} />
                {dict.trip.chatStart}
              </Link>
              <button type="button" className="trip-link-button" onClick={change}>
                {t.tripChange}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
