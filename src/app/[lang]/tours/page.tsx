import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToursCatalog, ToursHero } from "@/components/tours/tours-catalog/ToursCatalog";
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

  return (
    <Suspense fallback={<ToursHero kicker={dict.tours.heroTitle} title={dict.tours.heroText} />}>
      <ToursCatalog tours={tours} />
    </Suspense>
  );
}
