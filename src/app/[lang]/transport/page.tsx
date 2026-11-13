import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/common/listing-page/ListingPage";
import { getTransports } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { carItem, gridLabels } from "@/utils/listing-items";
import { alternates } from "@/utils/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/transport">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.transportTitle, description: dict.meta.transportDescription, alternates: alternates(lang, "/transport") };
}

export default async function TransportPage({ params }: PageProps<"/[lang]/transport">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, cars] = await Promise.all([getDictionary(lang), getTransports(lang)]);
  const items = [...cars].sort((a, b) => a.seats - b.seats).map((car) => carItem(car, lang, dict));

  return (
    <ListingPage
      hero={{ kicker: dict.offers.servicesKicker, title: dict.transport.title, text: dict.transport.heroText, image: "/images/pages/transport-hero.webp" }}
      items={items}
      labels={gridLabels(dict, dict.transport.back, dict.transport.sort)}
      locale={lang}
      dict={dict}
    />
  );
}
