import type { IconName } from "@/components/ui/icon/Icon";
import type { PickKind } from "./trip-store";

export const KIND_ICONS: Record<PickKind, IconName> = { tour: "route", hotel: "bed", car: "car", helicopter: "helicopter", trekking: "backpack" };
