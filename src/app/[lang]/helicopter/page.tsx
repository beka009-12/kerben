import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/common/listing-page/ListingPage";
import { getHelicopterTours } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { flightItem, gridLabels } from "@/utils/listing-items";
import { alternates } from "@/utils/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/helicopter">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.helicopterTitle, description: dict.meta.helicopterDescription, alternates: alternates(lang, "/helicopter") };
}

export default async function HelicopterPage({ params }: PageProps<"/[lang]/helicopter">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, flights] = await Promise.all([getDictionary(lang), getHelicopterTours(lang)]);

  return (
    <ListingPage
      hero={{ kicker: dict.offers.servicesKicker, title: dict.helicopter.title, text: dict.helicopter.text, image: "/images/pages/helicopter-hero.webp" }}
      items={flights.map((flight) => flightItem(flight, lang, dict))}
      labels={gridLabels(dict, dict.offers.all, dict.tours.pricePerPerson)}
      filters={false}
      locale={lang}
      dict={dict}
    />
  );
}
