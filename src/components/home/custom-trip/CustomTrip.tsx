import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./custom-trip.css";

export function CustomTrip({ image, locale, dict }: { image: string; locale: Locale; dict: Dictionary }) {
  const t = dict.home.custom;
  return (
    <section id="custom" className="custom-trip" aria-labelledby="custom-title">
      <div className="container custom-trip-inner">
        <div className="custom-trip-media">
          <Image src={image} alt="" fill sizes="(min-width: 1024px) 568px, 100vw" className="custom-trip-image" />
        </div>
        <div className="custom-trip-copy">
          <p className="custom-trip-kicker">{t.kicker}</p>
          <h2 id="custom-title" className="custom-trip-title">
            {t.title}
          </h2>
          <p className="custom-trip-lead">{t.lead}</p>
          <ul className="custom-trip-audiences">
            {t.audiences.map((audience) => (
              <li key={audience} className="custom-trip-chip">
                {audience}
              </li>
            ))}
          </ul>
          <Link href={`/${locale}/chat?ask=${encodeURIComponent(t.ask)}`} className="custom-trip-cta">
            {t.cta}
            <Icon name="arrowRight" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
