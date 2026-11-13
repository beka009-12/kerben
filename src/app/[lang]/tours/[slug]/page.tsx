import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingCard } from "@/components/common/booking-card/BookingCard";
import { CtaBanner, CtaBannerLink } from "@/components/common/cta-banner/CtaBanner";
import { DetailAbout, type DetailFact } from "@/components/common/detail-about/DetailAbout";
import { DetailSection } from "@/components/common/detail-section/DetailSection";
import { Faq } from "@/components/home/faq/Faq";
import { HotelCard } from "@/components/hotels/hotel-card/HotelCard";
import { TourHeader, type TourHeaderMeta } from "@/components/tour/tour-header/TourHeader";
import { TourInclusions } from "@/components/tour/tour-inclusions/TourInclusions";
import { TourItinerary } from "@/components/tour/tour-itinerary/TourItinerary";
import { TourReviews } from "@/components/tour/tour-reviews/TourReviews";
import { TourCard } from "@/components/tours/tour-card/TourCard";
import { Icon } from "@/components/ui/icon/Icon";
import { PhotoGallery } from "@/components/ui/photo-gallery/PhotoGallery";
import { siteConfig } from "@/config/site";
import { getFaqs, getHotels } from "@/utils/api/catalog";
import { getTour, getTours, getTourSlugs, hasLocation } from "@/utils/api/tours";
import { bookingLabels, countField, dateField, getBookingExtras } from "@/utils/contact/booking-extras";
import { formatPrice, plural } from "@/utils/format";
import { nearestHotels } from "@/utils/geo/nearest-hotels";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import { tourLocation } from "@/utils/tour-filters";
import "./tour-page.css";

export async function generateStaticParams() {
  const slugs = await getTourSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tours/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const tour = await getTour(slug, lang);
  if (!tour) return {};
  return {
    title: tour.title,
    description: tour.summary,
    alternates: alternates(lang, `/tours/${slug}`),
    openGraph: { title: tour.title, description: tour.summary, images: [{ url: tour.image }] },
  };
}

export default function TourPage({ params }: PageProps<"/[lang]/tours/[slug]">) {
  return (
    <Suspense fallback={<div className="tour-page-skeleton" aria-busy="true" />}>
      <TourContent params={params} />
    </Suspense>
  );
}

async function TourContent({ params }: { params: PageProps<"/[lang]/tours/[slug]">["params"] }) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, tour, all, hotels, faqs] = await Promise.all([getDictionary(lang), getTour(slug, lang), getTours(lang), getHotels(lang), getFaqs(lang)]);
  if (!tour) notFound();

  const t = dict.tour;
  const extras = await getBookingExtras(lang, dict, tour.price);
  const nearby = nearestHotels(hotels, tour.point ?? (hasLocation(tour) ? tour.coords : null), 2).map((item) => item.hotel);
  const related = all.filter((item) => item.slug !== tour.slug && (item.category === tour.category || item.region === tour.region)).slice(0, 3);
  const category = tourLocation(tour);
  const daysText = tour.days > 0 ? (tour.days === 1 ? dict.card.oneDay : `${tour.days} ${plural(tour.days, lang, t.dayForms)}`) : null;
  const nights = tour.nights ?? null;

  const meta: TourHeaderMeta[] = [
    ...(daysText ? [{ icon: "clock" as const, text: daysText }] : []),
    ...(tour.country ? [{ icon: "mapPin" as const, text: tour.country }] : []),
  ];
  const facts: DetailFact[] = [
    ...(daysText ? [{ label: t.duration, value: daysText }] : []),
    ...(nights !== null ? [{ label: t.nights, value: nights > 0 ? `${nights} ${plural(nights, lang, t.nightForms)}` : t.noNights }] : []),
    ...(category ? [{ label: t.category, value: category }] : []),
  ];
  const question = dict.ai.askTour.replace("{title}", tour.title);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.summary,
    image: tour.image.startsWith("http") ? tour.image : `${siteConfig.url}${tour.image}`,
    offers: { "@type": "Offer", price: tour.price, priceCurrency: "USD" },
    ...(tour.reviews > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: tour.rating, reviewCount: tour.reviews },
    }),
    itinerary: {
      "@type": "ItemList",
      itemListElement: tour.itinerary.map((stage, i) => ({ "@type": "ListItem", position: i + 1, name: stage.title })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <TourHeader title={tour.title} kicker={category} meta={meta} section={{ href: `/${lang}/tours`, label: dict.nav.tours }} locale={lang} dict={dict} />

      <section className="tour-page-main">
        <div className="container">
          <PhotoGallery
            images={[tour.image, ...tour.gallery]}
            name={tour.title}
            layout="mosaic"
            labels={{ photos: dict.hotels.photos, photo: dict.hotels.photo, close: dict.a11y.close, prev: dict.a11y.prev, next: dict.a11y.next }}
          />
          <div className="tour-page-layout">
            <div className="tour-page-content">
              <DetailAbout title={t.about} text={tour.overview} facts={facts} />
              {tour.itinerary.length > 0 && <TourItinerary itinerary={tour.itinerary} />}
              <TourInclusions tour={tour} dict={dict} />
              {nearby.length > 0 && (
                <DetailSection id="hotels" title={t.hotelsTitle}>
                  <ul className="tour-page-cards">
                    {nearby.map((hotel) => (
                      <li key={hotel.id}>
                        <HotelCard hotel={hotel} locale={lang} dict={dict} sizes="(min-width: 1280px) 338px, (min-width: 700px) 45vw, 92vw" />
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              )}
              {/^\d{1,9}$/.test(tour.slug) && <TourReviews tourSlug={tour.slug} />}
            </div>
            <aside className="tour-page-aside" aria-label={t.contact}>
              <BookingCard
                title={tour.title}
                price={tour.price > 0 ? formatPrice(tour.price, lang) : null}
                otherPrices={extras.otherPrices}
                ratesNote={extras.ratesNote}
                fields={[dateField("date", t.date), countField("guests", t.travellers, t.adultForms, lang)]}
                contacts={extras.contacts}
                chatHref={`/${lang}/chat`}
                askHref={`/${lang}/chat?ask=${encodeURIComponent(question)}`}
                labels={bookingLabels(dict, t.perPerson, { heading: t.tripKicker })}
              />
            </aside>
          </div>
        </div>
      </section>

      <Faq locale={lang} dict={dict} items={faqs.slice(0, 6)} soft />

      {related.length > 0 && (
        <section className="tour-page-related" aria-labelledby="related-title">
          <div className="container">
            <h2 id="related-title" className="tour-page-related-title">
              {t.related}
            </h2>
            <ul className="tour-page-related-list">
              {related.map((item) => (
                <li key={item.slug}>
                  <TourCard tour={item} locale={lang} dict={dict} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="tour-page-cta">
        <div className="container">
          <CtaBanner
            eyebrow={t.ctaEyebrow}
            title={dict.cta.title}
            text={dict.cta.tourText}
            image="/images/pages/cta-tour.webp"
            trust={t.ctaTrust}
            actions={
              <>
                <CtaBannerLink href={`/${lang}/tours`} variant="primary">
                  {dict.hero.primary}
                  <Icon name="arrowRight" size={18} />
                </CtaBannerLink>
                <CtaBannerLink href={`/${lang}/chat?ask=${encodeURIComponent(question)}`} variant="glass">
                  <Icon name="sparkle" size={18} />
                  {dict.ai.tourButton}
                </CtaBannerLink>
              </>
            }
          />
        </div>
      </section>
    </>
  );
}
