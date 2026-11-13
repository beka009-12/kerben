import Link from "next/link";
import type { ReactNode } from "react";
import { ListingCard } from "@/components/common/listing-card/ListingCard";
import type { ListingGridItem } from "@/components/common/listing-grid/ListingGrid";
import { TourHeader, type TourHeaderMeta } from "@/components/tour/tour-header/TourHeader";
import { Icon } from "@/components/ui/icon/Icon";
import { PhotoGallery } from "@/components/ui/photo-gallery/PhotoGallery";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./detail-layout.css";

export function DetailLayout({
  header,
  images,
  caption,
  aside,
  others,
  locale,
  dict,
  children,
}: {
  header: { title: string; kicker?: string; meta: TourHeaderMeta[]; section: { href: string; label: string } };
  images: string[];
  caption?: string;
  aside: ReactNode;
  others?: { title: string; link: { href: string; label: string }; items: ListingGridItem[] };
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return (
    <>
      <TourHeader title={header.title} kicker={header.kicker} meta={header.meta} section={header.section} locale={locale} dict={dict} />
      <section className="detail-layout">
        <div className="container">
          <PhotoGallery
            images={images}
            name={header.title}
            caption={caption}
            labels={{ photos: dict.hotels.photos, photo: dict.hotels.photo, close: dict.a11y.close, prev: dict.a11y.prev, next: dict.a11y.next }}
          />
          <div className="detail-layout-columns">
            <div className="detail-layout-content">{children}</div>
            <aside className="detail-layout-aside">{aside}</aside>
          </div>
        </div>
      </section>
      {others && others.items.length > 0 && (
        <section className="detail-layout-others" aria-labelledby="detail-others">
          <div className="container">
            <div className="detail-layout-others-head">
              <h2 id="detail-others" className="detail-layout-others-title">
                {others.title}
              </h2>
              <Link href={others.link.href} className="detail-layout-others-link">
                {others.link.label}
                <Icon name="arrowRight" size={18} />
              </Link>
            </div>
            <ul className="detail-layout-others-list">
              {others.items.map((item) => (
                <li key={item.id}>
                  <ListingCard {...item.card} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
