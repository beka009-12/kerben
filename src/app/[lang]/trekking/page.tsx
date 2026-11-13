import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/common/listing-page/ListingPage";
import { getTrekkings } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { gridLabels, trekItem } from "@/utils/listing-items";
import { alternates } from "@/utils/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/trekking">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.trekkingTitle, description: dict.meta.trekkingDescription, alternates: alternates(lang, "/trekking") };
}

export default async function TrekkingPage({ params }: PageProps<"/[lang]/trekking">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, treks] = await Promise.all([getDictionary(lang), getTrekkings(lang)]);

  return (
    <ListingPage
      hero={{ kicker: dict.offers.servicesKicker, title: dict.trekking.title, text: dict.trekking.heroText, image: "/images/home/experience-mountains.webp" }}
      items={treks.map((trek) => trekItem(trek, lang, dict))}
      labels={gridLabels(dict, dict.offers.all, dict.tours.pricePerPerson)}
      filters={false}
      locale={lang}
      dict={dict}
    />
  );
}
