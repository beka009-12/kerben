import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HotelBookingCard } from "@/components/hotels/hotel-booking-card/HotelBookingCard";
import { HotelCard } from "@/components/hotels/hotel-card/HotelCard";
import { AMENITY_ICONS } from "@/utils/hotels/amenity-icons";
import { PhotoGallery } from "@/components/ui/photo-gallery/PhotoGallery";
import { BackLink } from "@/components/ui/back-link/BackLink";
import { Icon } from "@/components/ui/icon/Icon";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { getHotel, getHotels } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import "./hotel-page.css";

export async function generateStaticParams() {
  const hotels = await getHotels("ru");
  return [{ id: hotels[0]?.id ?? "0" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/hotels/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const hotel = await getHotel(lang, id);
  if (!hotel) return {};
  return {
    title: hotel.name,
    description: hotel.description || hotel.location,
    alternates: alternates(lang, `/hotels/${id}`),
    openGraph: { title: hotel.name, images: [{ url: hotel.image }] },
  };
}

export default function HotelPage({ params }: PageProps<"/[lang]/hotels/[id]">) {
  return (
    <Suspense fallback={<div className="hotel-page-skeleton" aria-busy="true" />}>
      <HotelContent params={params} />
    </Suspense>
  );
}

async function HotelContent({ params }: { params: PageProps<"/[lang]/hotels/[id]">["params"] }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, hotels] = await Promise.all([getDictionary(lang), getHotels(lang)]);
  const hotel = hotels.find((h) => h.id === id);
  if (!hotel) notFound();

  const t = dict.hotels;
  const names = t.amenities as Record<string, string>;
  const place = hotel.location || hotel.address;
  const others = hotels.filter((h) => h.id !== hotel.id).slice(0, 3);
  const mapHref = hotel.coords
    ? `https://www.google.com/maps/search/?api=1&query=${hotel.coords[1]},${hotel.coords[0]}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${place}`)}`;
  const mapEmbed = hotel.coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${hotel.coords[0] - 0.02},${hotel.coords[1] - 0.012},${hotel.coords[0] + 0.02},${hotel.coords[1] + 0.012}&layer=mapnik&marker=${hotel.coords[1]},${hotel.coords[0]}`
    : null;

  return (
    <article className="hotel-page">
      <div className="container">
        <BackLink href={`/${lang}/hotels`} label={t.back} className="hotel-page-back" />

        <header className="hotel-page-head">
          <div className="hotel-page-meta">
            {place && (
              <span className="hotel-page-place">
                <Icon name="mapPin" size={15} />
                {place}
              </span>
            )}
          </div>
          <h1 className="hotel-page-title">{hotel.name}</h1>
        </header>

        <PhotoGallery
          images={[hotel.image, ...hotel.gallery]}
          name={hotel.name}
          labels={{ photos: t.photos, photo: t.photo, close: dict.a11y.close, prev: dict.a11y.prev, next: dict.a11y.next }}
        />

        <div className="hotel-page-layout">
          <div className="hotel-page-main">
            <section className="hotel-page-section" aria-labelledby="hotel-about">
              <h2 id="hotel-about" className="hotel-page-heading">
                {t.about}
              </h2>
              <p className="hotel-page-text">{hotel.description || t.aboutFallback}</p>
            </section>

            {hotel.amenities.length > 0 && (
              <section className="hotel-page-section" aria-labelledby="hotel-amenities">
                <h2 id="hotel-amenities" className="hotel-page-heading">
                  {t.amenitiesTitle}
                </h2>
                <ul className="hotel-page-amenities">
                  {hotel.amenities.map((key) => (
                    <li key={key} className="hotel-page-amenity">
                      <span className="hotel-page-amenity-icon">
                        <Icon name={AMENITY_ICONS[key] ?? "check"} size={20} />
                      </span>
                      {names[key] ?? key}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="hotel-page-section" aria-labelledby="hotel-location">
              <h2 id="hotel-location" className="hotel-page-heading">
                {t.location}
              </h2>
              {(hotel.address || place) && (
                <p className="hotel-page-address">
                  <Icon name="mapPin" size={18} />
                  {[hotel.address, hotel.location].filter(Boolean).join(" · ")}
                </p>
              )}
              {mapEmbed && (
                <div className="hotel-page-map">
                  <iframe src={mapEmbed} title={`${t.location}: ${hotel.name}`} loading="lazy" className="hotel-page-map-frame" />
                </div>
              )}
              <a href={mapHref} target="_blank" rel="noopener noreferrer" className="hotel-page-map-link">
                {t.openMap}
                <Icon name="arrowRight" size={16} />
              </a>
            </section>
          </div>

          <HotelBookingCard hotel={hotel} locale={lang} dict={dict} />
        </div>
      </div>

      {others.length > 0 && (
        <section className="section section-soft hotel-page-others" aria-labelledby="hotel-others">
          <Reveal className="container">
            <div className="hotel-page-others-head">
              <h2 id="hotel-others" className="hotel-page-others-title">
                {t.other}
              </h2>
              <Link href={`/${lang}/hotels`} className="hotel-page-others-link">
                {t.back}
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <ul className="hotel-page-others-list">
              {others.map((item) => (
                <li key={item.id}>
                  <HotelCard hotel={item} locale={lang} dict={dict} />
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}
    </article>
  );
}
