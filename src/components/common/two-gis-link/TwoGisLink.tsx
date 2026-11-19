import { Icon } from "@/components/ui/icon/Icon";
import { siteConfig } from "@/config/site";
import { localeNames, type Locale } from "@/utils/i18n/config";
import "./two-gis-link.css";

export interface TwoGisLabels {
  /** Видимый текст, {rating} — рейтинг */
  text: string;
  /** Полное название ссылки для скринридера, {rating} — рейтинг */
  label: string;
}

export function TwoGisLink({ locale, labels, className }: { locale: Locale; labels: TwoGisLabels; className?: string }) {
  const rating = new Intl.NumberFormat(localeNames[locale].intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(siteConfig.twoGis.rating);
  return (
    <a
      href={siteConfig.twoGis.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? `two-gis-link ${className}` : "two-gis-link"}
      aria-label={labels.label.replace("{rating}", rating)}
    >
      <Icon name="star" size={16} filled className="two-gis-link-star" />
      {labels.text.replace("{rating}", rating)}
    </a>
  );
}
