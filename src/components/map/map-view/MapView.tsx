"use client";

import { createPortal } from "react-dom";
import { MapPopup } from "@/components/map/map-popup/MapPopup";
import { DEFAULT_VIEW, useMapView, type MapViewProps } from "@/utils/map/use-map-view";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map-view.css";

export function MapView({
  theme = "light",
  markers = [],
  route,
  focus,
  initialView = DEFAULT_VIEW,
  fitToMarkers = false,
  interactive = true,
  activeId,
  onMarkerClick,
  ariaLabel,
  loadingText,
  errorText,
  className,
}: MapViewProps) {
  const { containerRef, status, popupNode, selected } = useMapView({ theme, markers, route, focus, initialView, fitToMarkers, interactive, activeId, onMarkerClick });

  return (
    <div className={["map-view", className].filter(Boolean).join(" ")}>
      <div ref={containerRef} className="map-view-canvas" role="region" aria-label={ariaLabel} />
      {status !== "ready" && (
        <div className={theme === "dark" ? "map-view-overlay map-view-overlay-dark" : "map-view-overlay"} role="status">
          {status === "loading" ? <span className="map-view-spinner" aria-hidden="true" /> : null}
          <span>{status === "loading" ? loadingText : errorText}</span>
        </div>
      )}
      {popupNode && selected && createPortal(<MapPopup card={selected.card ?? { title: selected.title }} />, popupNode)}
    </div>
  );
}
