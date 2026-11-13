import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { DestinationCard } from "@/components/home/destination-card/DestinationCard";
import { ExploreDestinations } from "@/components/home/explore-destinations/ExploreDestinations";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { SectionHeader } from "@/components/ui/section-header/SectionHeader";
import { pagePhoto } from "@/data/images";
import { getTours } from "@/utils/api/tours";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { countByRegion, tourMarkers } from "@/utils/markers";
import { alternates } from "@/utils/seo";
import "./destinations-page.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/destinations">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.destinationsTitle,
    description: dict.meta.destinationsDescription,
    alternates: alternates(lang, "/destinations"),
  };
}

export default async function DestinationsPage({ params }: PageProps<"/[lang]/destinations">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, tours] = await Promise.all([getDictionary(lang), getTours(lang)]);
  const t = dict.destinations;

  return (
    <>
      <PageHero kicker={t.kicker} title={t.title} text={t.text} image={pagePhoto("lake-peaks-hd")} />
      <section className="section section-soft">
        <div className="container">
          <ExploreDestinations markers={tourMarkers(tours, lang, dict.card)} counts={countByRegion(tours)} />
        </div>
      </section>
      {tours.length > 0 && (
        <section className="section" aria-labelledby="all-destinations">
          <Reveal className="container">
            <SectionHeader id="all-destinations" title={t.all} />
            <ul className="destinations-page-grid">
              {tours.map((tour) => (
                <li key={tour.slug}>
                  <DestinationCard tour={tour} locale={lang} fromLabel={dict.card.from} daysLabel={dict.card.days}
      oneDayLabel={dict.card.oneDay} perLabel={dict.card.perPerson}
                  categoryLabel={tour.categoryName ?? dict.categories.items[tour.category]?.title}
                />
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}
    </>
  );
}
