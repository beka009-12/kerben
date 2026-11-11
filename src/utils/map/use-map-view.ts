"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker, Popup as MapLibrePopup } from "maplibre-gl";
import type { LngLat } from "@/types/tour";

export interface MapCard {
  image?: string;
  title: string;
  subtitle?: string;
  text?: string;
  meta?: string;
  rating?: number;
  price?: string;
  href?: string;
  cta?: string;
}

export interface MapMarker {
  id: string;
  coords: LngLat;
  title: string;
  label?: string;
  href?: string;
  card?: MapCard;
}

export interface MapFocus {
  center: LngLat;
  zoom: number;
}

export interface MapViewProps {
  theme?: "light" | "dark";
  markers?: MapMarker[];
  route?: LngLat[];
  focus?: MapFocus | null;
  initialView?: MapFocus;
  fitToMarkers?: boolean;
  interactive?: boolean;
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
  ariaLabel: string;
  loadingText: string;
  errorText: string;
  className?: string;
}

export const DEFAULT_VIEW: MapFocus = { center: [20, 25], zoom: 1.4 };

const CLUSTER_PX = 28;
const CLUSTER_MAX_ZOOM = 8;

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

export function useMapView({ theme = "light", markers = [], route, focus, initialView = DEFAULT_VIEW, fitToMarkers = false, interactive = true, activeId, onMarkerClick }: Pick<MapViewProps, "theme" | "markers" | "route" | "focus" | "initialView" | "fitToMarkers" | "interactive" | "activeId" | "onMarkerClick">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef<Map<string, { marker: MapLibreMarker; el: HTMLElement }>>(new Map());
  const popupRef = useRef<MapLibrePopup | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupNode] = useState(() => (typeof document === "undefined" ? null : document.createElement("div")));
  const selected = markers.find((m) => m.id === selectedId) ?? null;

  const handleLoad = useEffectEvent((map: MapLibreMap, lib: typeof import("maplibre-gl")) => {
    if (route && route.length > 1) {
      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route } },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#145ff0", "line-width": 3.5, "line-dasharray": [1.5, 1.2] },
      });
    }

    if (interactive && popupNode) {
      const popup = new lib.Popup({ anchor: "bottom", offset: 16, maxWidth: "none", className: "map-view-popup", focusAfterOpen: false });
      popup.setDOMContent(popupNode);
      popup.on("close", () => setSelectedId(null));
      popupRef.current = popup;
    }

    for (const item of markers) {
      const el = document.createElement(interactive ? "button" : "span");
      el.className = interactive ? "map-view-pin" : "map-view-pin map-view-pin-static";
      if (interactive) {
        (el as HTMLButtonElement).type = "button";
        el.setAttribute("aria-label", item.title);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          const here = map.project(item.coords);
          const near = markers.filter((m) => m.id !== item.id && map.project(m.coords).dist(here) < CLUSTER_PX);
          if (near.length > 0 && map.getZoom() < CLUSTER_MAX_ZOOM) {
            setSelectedId(null);
            const bounds = new lib.LngLatBounds(item.coords, item.coords);
            for (const m of near) bounds.extend(m.coords);
            map.fitBounds(bounds, { padding: 120, maxZoom: CLUSTER_MAX_ZOOM, duration: 900, essential: true });
            return;
          }
          setSelectedId(item.id);
          onMarkerClick?.(item.id);
        });
      } else {
        el.setAttribute("aria-hidden", "true");
      }
      const dot = document.createElement("span");
      dot.className = "map-view-dot";
      el.append(dot);
      if (item.label) {
        const label = document.createElement("span");
        label.className = "map-view-pin-label";
        label.textContent = item.label;
        el.append(label);
      }
      const marker = new lib.Marker({ element: el, anchor: "center" }).setLngLat(item.coords).addTo(map);
      markerRefs.current.set(item.id, { marker, el });
    }

    if (fitToMarkers) {
      const points = route && route.length > 1 ? route : markers.map((m) => m.coords);
      if (points.length > 1) {
        const bounds = new lib.LngLatBounds(points[0], points[0]);
        for (const point of points) bounds.extend(point);
        map.fitBounds(bounds, { padding: 48, duration: 0, maxZoom: 9 });
      } else if (points.length === 1) {
        map.jumpTo({ center: points[0], zoom: 8 });
      }
    }
    setStatus("ready");
  });

  const [lng, lat] = initialView.center;
  const zoom = initialView.zoom;

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;
    const markersMap = markerRefs.current;

    (async () => {
      try {
        const lib = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;
        lib.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

        map = new lib.Map({
          container: containerRef.current,
          style: STYLES[theme],
          center: [lng, lat],
          zoom,
          interactive,
          attributionControl: { compact: true },
          renderWorldCopies: false,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        });
        mapRef.current = map;
        if (interactive) map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
        map.on("error", () => {
          if (map && !map.isStyleLoaded()) setStatus("error");
        });
        map.on("load", () => map && handleLoad(map, lib));
      } catch (error) {
        console.error("Map init failed", error);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      markersMap.clear();
      map?.remove();
      mapRef.current = null;
      popupRef.current = null;
    };
  }, [theme, interactive, lng, lat, zoom]);

  useEffect(() => {
    if (status !== "ready" || !focus) return;
    mapRef.current?.flyTo({ center: focus.center, zoom: focus.zoom, duration: 1600, essential: true });
  }, [focus, status]);

  useEffect(() => {
    const map = mapRef.current;
    const popup = popupRef.current;
    if (status !== "ready" || !map || !popup) return;
    const item = markers.find((m) => m.id === selectedId);
    if (!item) {
      if (popup.isOpen()) popup.remove();
      return;
    }
    popup.setLngLat(item.coords);
    if (!popup.isOpen()) popup.addTo(map);
    const bottomOffset = Math.max(0, map.getContainer().clientHeight / 2 - 40);
    map.easeTo({ center: item.coords, offset: [0, bottomOffset], duration: 700, essential: true });
  }, [selectedId, markers, status]);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  useEffect(() => {
    const highlighted = selectedId ?? activeId;
    for (const [id, { el }] of markerRefs.current) {
      el.classList.toggle("map-view-pin-active", id === highlighted);
    }
  }, [selectedId, activeId, status]);

  return { containerRef, status, popupNode, selected };
}
