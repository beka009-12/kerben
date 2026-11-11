import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogCard } from "@/components/tours/catalog-card/CatalogCard";
import { TOURS_HERO, ToursCatalog } from "@/components/tours/tours-catalog/ToursCatalog";
import { getTours } from "@/utils/api/tours";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import "@/components/tours/tours-catalog/tours-catalog.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/tours">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.toursTitle, description: dict.meta.toursDescription, alternates: alternates(lang, "/tours") };
}

export default async function ToursPage({ params }: PageProps<"/[lang]/tours">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, tours] = await Promise.all([getDictionary(lang), getTours(lang)]);
  const t = dict.tours;
  const labels = { from: dict.card.from, perPerson: dict.card.perPerson, more: dict.card.more, durations: t.durations, days: dict.card.days };

  return (
    <Suspense
      fallback={
        <div className="tours-catalog">
          <section className="tours-catalog-hero" aria-labelledby="tours-title">
            <Image src={TOURS_HERO} alt="" fill priority quality={85} sizes="100vw" className="tours-catalog-hero-image" />
            <div className="tours-catalog-hero-shade" aria-hidden="true" />
            <div className="tours-catalog-hero-inner">
              <h1 id="tours-title" className="tours-catalog-hero-title">
                {t.heroTitle}
              </h1>
              <p className="tours-catalog-hero-text">{t.heroText}</p>
            </div>
          </section>
          <div className="tours-catalog-layout tours-catalog-layout-fallback">
            <ul className="tours-catalog-grid">
              {tours.slice(0, 9).map((tour) => (
                <li key={tour.slug} className="tours-catalog-item">
                  <CatalogCard tour={tour} locale={lang} labels={labels} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    >
      <ToursCatalog tours={tours} />
    </Suspense>
  );
}
