import type { LngLat, Region } from "@/types/tour";

export const regions: { key: Region; center: LngLat; zoom: number }[] = [
  { key: "asia", center: [90, 30], zoom: 2.2 },
  { key: "europe", center: [12, 49], zoom: 3.2 },
  { key: "africa", center: [20, 3], zoom: 2.4 },
  { key: "northAmerica", center: [-100, 44], zoom: 2.3 },
  { key: "southAmerica", center: [-60, -18], zoom: 2.4 },
  { key: "oceania", center: [140, -25], zoom: 2.8 },
];
