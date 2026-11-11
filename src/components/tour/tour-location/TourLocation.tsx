"use client";

import dynamic from "next/dynamic";
import type { Tour } from "@/types/tour";
import { useTourLocation } from "@/utils/tour/use-tour-location";
import "./tour-location.css";

const MapView = dynamic(() => import("@/components/map/map-view/MapView").then((m) => m.MapView), { ssr: false });

export function TourLocation({ itinerary }: { itinerary: Tour["itinerary"] }) {
  const { dict, t, markers, route } = useTourLocation({ itinerary });

  return (
    <section id="location" className="tour-location" aria-labelledby="location-title">
      <h2 id="location-title" className="tour-location-title">
        {t.mapTitle}
      </h2>
      <div className="tour-location-map">
        <MapView
          markers={markers}
          route={route}
          fitToMarkers
          ariaLabel={t.mapTitle}
          loadingText={dict.explore.loading}
          errorText={dict.explore.error}
        />
      </div>
    </section>
  );
}
