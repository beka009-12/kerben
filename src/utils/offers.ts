import type { IconName } from "@/components/ui/icon/Icon";
import type { PriceUnit } from "@/utils/api/backend";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";

export function offerPrice(price: number, unit: PriceUnit, locale: Locale, dict: Dictionary): string {
  if (price <= 0) return "";
  return `${dict.offers.from} ${formatPrice(price, locale)} ${dict.units[unit] ?? ""}`.trim();
}

export const fill = (template: string, n: number | string) => template.replace("{n}", String(n));

export interface OfferFact {
  icon: IconName;
  label: string;
}
