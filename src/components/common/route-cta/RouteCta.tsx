import { CtaBanner, CtaBannerLink } from "@/components/common/cta-banner/CtaBanner";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./route-cta.css";

const ROUTE_CTA_IMAGE = "/images/pages/cta-custom.webp";

/** «Не нашли подходящую программу?» — внизу каталога туров и страниц услуг */
export function RouteCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.tours.cta;
  return (
    <div className="route-cta">
      <div className="container">
        <CtaBanner
          eyebrow={t.eyebrow}
          title={t.title}
          text={t.text}
          image={ROUTE_CTA_IMAGE}
          trust={t.trust}
          actions={
            <>
              <CtaBannerLink href={`/${locale}/chat?ask=${encodeURIComponent(dict.home.custom.ask)}`} variant="primary">
                {t.primary}
                <Icon name="arrowRight" size={18} />
              </CtaBannerLink>
              <CtaBannerLink href={`/${locale}/chat`} variant="glass">
                <Icon name="sparkle" size={18} />
                {t.ask}
              </CtaBannerLink>
            </>
          }
        />
      </div>
    </div>
  );
}
