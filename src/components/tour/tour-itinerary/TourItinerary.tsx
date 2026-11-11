"use client";

import { Icon } from "@/components/ui/icon/Icon";
import type { Tour } from "@/types/tour";
import { PREVIEW, useTourItinerary } from "@/utils/tour/use-tour-itinerary";
import "./tour-itinerary.css";

export function TourItinerary({ itinerary }: { itinerary: Tour["itinerary"] }) {
  const { t, expanded, setExpanded, shown } = useTourItinerary({ itinerary });

  return (
    <section id="itinerary" className="tour-itinerary" aria-labelledby="itinerary-title">
      <h2 id="itinerary-title" className="tour-itinerary-title">
        {t.itinerary}
      </h2>
      <ol className="tour-itinerary-list">
        {shown.map((stage) => (
          <li key={stage.day} className="tour-itinerary-item">
            <span className="tour-itinerary-day">
              {t.day} {stage.day}
            </span>
            <div className="tour-itinerary-body">
              <h3 className="tour-itinerary-name">{stage.title}</h3>
              <p className="tour-itinerary-text">{stage.text}</p>
            </div>
          </li>
        ))}
      </ol>
      {itinerary.length > PREVIEW && (
        <button type="button" className="tour-itinerary-toggle" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
          {expanded ? t.showLess : t.showFull}
          <Icon name={expanded ? "chevronDown" : "arrowRight"} size={16} />
        </button>
      )}
    </section>
  );
}
