import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { TripsTabs } from "@/components/trips/trips-tabs/TripsTabs";
import { getTours } from "@/utils/api/tours";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/trips">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.tripsTitle, robots: { index: false } };
}

export default async function TripsPage({ params }: PageProps<"/[lang]/trips">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, tours] = await Promise.all([getDictionary(lang), getTours(lang)]);
  const t = dict.trips;

  return (
    <>
      <PageHero kicker={t.kicker} title={t.title} text={t.text} image="/images/pages/trips-hero.webp" />
      <section className="trips-page-section">
        <div className="container">
          <Suspense fallback={<div className="trips-tabs-fallback" aria-busy="true" />}>
            <TripsTabs tours={tours} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
