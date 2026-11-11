"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "@/utils/map/use-map-view";
import { Icon } from "@/components/ui/icon/Icon";
import type { Region } from "@/types/tour";
import { WORLD, useExploreDestinations } from "@/utils/home/use-explore-destinations";
import "./explore-destinations.css";

const MapView = dynamic(() => import("@/components/map/map-view/MapView").then((m) => m.MapView), { ssr: false });

export function ExploreDestinations({ markers, counts }: { markers: MapMarker[]; counts: Partial<Record<Region, number>> }) {
  const { t, active, setActive, available, total, hasHidden, focus } = useExploreDestinations({ counts });

  return (
    <div className="explore">
      <div className="explore-head">
        <h2 className="explore-title">{t.title}</h2>
        <p className="explore-text">{t.text}</p>
      </div>
      <div className="explore-body">
        <div className="explore-map">
          <MapView
            theme="dark"
            markers={markers}
            focus={focus}
            initialView={WORLD}
            ariaLabel={t.title}
            loadingText={t.loading}
            errorText={t.error}
          />
        </div>
        <ul className="explore-regions">
          <li className="explore-regions-wide">
            <button
              type="button"
              className={active === null ? "explore-region explore-region-active" : "explore-region"}
              aria-pressed={active === null}
              onClick={() => setActive(null)}
            >
              <Icon name="globe" size={18} />
              <span className="explore-region-name">{t.world}</span>
              <span className="explore-region-count" aria-label={`${total} ${t.tours}`}>
                {total}
              </span>
            </button>
          </li>
          {available.map((region) => (
            <li key={region.key}>
              <button
                type="button"
                className={active === region.key ? "explore-region explore-region-active" : "explore-region"}
                aria-pressed={active === region.key}
                onClick={() => setActive(region.key)}
              >
                <Icon name="compass" size={18} />
                <span className="explore-region-name">{t.regions[region.key]}</span>
                <span className="explore-region-count" aria-label={`${region.count} ${t.tours}`}>
                  {region.count}
                </span>
              </button>
            </li>
          ))}
          {hasHidden && <li className="explore-regions-wide explore-regions-note">{t.soon}</li>}
        </ul>
      </div>
    </div>
  );
}
