import { CtaBanner } from "@/components/common/cta-banner/CtaBanner";
import { ButtonLink } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import type { Tour } from "@/types/tour";
import "./tour-cta.css";

export function TourCta({ tour, locale, dict }: { tour: Tour; locale: Locale; dict: Dictionary }) {
  const question = dict.ai.askTour.replace("{title}", tour.title);
  return (
    <CtaBanner
      title={dict.cta.title}
      text={dict.cta.tourText}
      image={tour.gallery[0] ?? tour.image}
      actions={
        <ButtonLink href={`/${locale}/chat?ask=${encodeURIComponent(question)}`} variant="ghost" size="lg">
          <Icon name="chat" size={18} />
          {dict.ai.tourButton}
        </ButtonLink>
      }
    />
  );
}
