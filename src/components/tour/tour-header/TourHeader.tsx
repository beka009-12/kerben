import Link from "next/link";
import { FavoriteButton } from "@/components/ui/favorite-button/FavoriteButton";
import { Icon } from "@/components/ui/icon/Icon";
import { PhotoGallery } from "@/components/ui/photo-gallery/PhotoGallery";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import type { Tour } from "@/types/tour";
import "./tour-header.css";

export function TourHeader({ tour, subtitle, locale, dict }: { tour: Tour; subtitle: string; locale: Locale; dict: Dictionary }) {
  return (
    <section className="tour-header" aria-labelledby="tour-title">
      <div className="container tour-header-inner">
        <nav className="tour-header-crumbs" aria-label={dict.tour.breadcrumbs}>
          <ol className="tour-header-crumbs-list">
            <li>
              <Link href={`/${locale}`}>{dict.nav.home}</Link>
              <Icon name="chevronRight" size={14} />
            </li>
            <li>
              <Link href={`/${locale}/tours`}>{dict.nav.tours}</Link>
              <Icon name="chevronRight" size={14} />
            </li>
            <li aria-current="page">{tour.title}</li>
          </ol>
        </nav>

        <div className="tour-header-head">
          <div className="tour-header-copy">
            <h1 id="tour-title" className="tour-header-title">
              {tour.title}
            </h1>
            {subtitle && <p className="tour-header-subtitle">{subtitle}</p>}
          </div>
          <FavoriteButton slug={tour.slug} title={tour.title} dark />
        </div>

        <PhotoGallery
          images={[tour.image, ...tour.gallery]}
          name={tour.title}
          layout="mosaic"
          labels={{ photos: dict.hotels.photos, photo: dict.hotels.photo, close: dict.a11y.close, prev: dict.a11y.prev, next: dict.a11y.next }}
        />
      </div>
    </section>
  );
}
