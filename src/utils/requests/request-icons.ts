import type { IconName } from "@/components/ui/icon/Icon";
import type { MyRequest, RequestKind } from "@/utils/requests";

export const REQUEST_KIND_ICONS: Record<RequestKind, IconName> = {
  tour: "route",
  hotel: "bed",
  transport: "car",
  helicopter: "helicopter",
  trekking: "mountain",
  request: "chat",
};

const KNOWN_ICONS = new Set<string>([...Object.values(REQUEST_KIND_ICONS), "ticket", "backpack"]);

export const ticketIcon = (name: string): IconName => (KNOWN_ICONS.has(name) ? name : "ticket") as IconName;

export const REQUEST_STEP: Record<MyRequest["status"], number> = { new: 1, in_progress: 2, completed: 3, cancelled: 0 };

export const REQUEST_STEP_KEYS = ["sent", "review", "confirmed"] as const;
