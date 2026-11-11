import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Faq } from "@/components/home/faq/Faq";
import { TourCta } from "@/components/tour/tour-cta/TourCta";
import { TourHeader } from "@/components/tour/tour-header/TourHeader";
import { TourHighlights } from "@/components/tour/tour-highlights/TourHighlights";
import { TourInclusions } from "@/components/tour/tour-inclusions/TourInclusions";
import { TourItinerary } from "@/components/tour/tour-itinerary/TourItinerary";
import { TourLocation } from "@/components/tour/tour-location/TourLocation";
import { TourSummary } from "@/components/tour/tour-summary/TourSummary";
import { TourReviews } from "@/components/tour/tour-reviews/TourReviews";
import { TourTabs, type SectionId } from "@/components/tour/tour-tabs/TourTabs";
import { TripPlanner } from "@/components/tour/trip-planner/TripPlanner";
import { TourCard } from "@/components/tours/tour-card/TourCard";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { siteConfig } from "@/config/site";
import { getFaqs, getHotels, getTransports } from "@/utils/api/catalog";
import { getTour, getTours, getTourSlugs, hasLocation } from "@/utils/api/tours";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import { tourLocation } from "@/utils/tour-filters";
import { nearestHotels } from "@/utils/geo/nearest-hotels";
import { carOffers, hotelOffers } from "@/utils/trip/trip-offers";
import { tourPick } from "@/utils/trip/trip-picks";
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

  const [dict, tour, all, hotels, transports, faqs] = await Promise.all([
    getDictionary(lang),
    getTour(slug, lang),
    getTours(lang),
    getHotels(lang),
    getTransports(lang),
    getFaqs(lang),
  ]);
  if (!tour) notFound();

  const nearby = nearestHotels(hotels, tour.point ?? (hasLocation(tour) ? tour.coords : null));

  const showItinerary = tour.itinerary.length > 0;
  const showLocation = hasLocation(tour);
  const hide: SectionId[] = [
    ...(showItinerary ? [] : (["itinerary"] as const)),
    ...(tour.included.length + tour.excluded.length > 0 ? [] : (["inclusions"] as const)),
    ...(showLocation ? [] : (["location"] as const)),
  ];

  const teaser = tour.summary.replace(/…$/, "").trim();
  const subtitle = teaser && !tour.overview.startsWith(teaser) ? tour.summary : tourLocation(tour);

  const related = all.filter((t) => t.slug !== tour.slug && (t.category === tour.category || t.region === tour.region)).slice(0, 3);

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
      <TourHeader tour={tour} subtitle={subtitle} locale={lang} dict={dict} />
      <TourSummary tour={tour} locale={lang} dict={dict} />
      <TourTabs hide={hide} />

      <div className="container tour-page-body">
        <Reveal>
          <TourHighlights tour={tour} title={dict.tour.highlights} />
        </Reveal>
        {(showItinerary || showLocation) && (
          <div className={showItinerary && showLocation ? "tour-page-split" : undefined}>
            {showItinerary && <TourItinerary itinerary={tour.itinerary} />}
            {showLocation && <TourLocation itinerary={tour.itinerary} />}
          </div>
        )}
        <TourInclusions tour={tour} dict={dict} />
        <Reveal>
          <TripPlanner
            tour={tourPick(tour, lang)}
            hotels={hotelOffers(nearby, lang, dict, `/${lang}/tours/${tour.slug}`)}
            cars={carOffers(transports.slice(0, 20), lang, dict, `/${lang}/tours/${tour.slug}`)}
          />
        </Reveal>
        {/^\d{1,9}$/.test(tour.slug) && <TourReviews tourSlug={tour.slug} />}
        <Reveal>
          <TourCta tour={tour} locale={lang} dict={dict} />
        </Reveal>
      </div>

      <Faq locale={lang} dict={dict} items={faqs.slice(0, 6)} />

      {related.length > 0 && (
        <section className="section section-soft" aria-labelledby="related-title">
          <div className="container">
            <h2 id="related-title" className="tour-page-related-title">
              {dict.tour.related}
            </h2>
            <ul className="tour-page-related">
              {related.map((item) => (
                <li key={item.slug}>
                  <TourCard tour={item} locale={lang} dict={dict} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
