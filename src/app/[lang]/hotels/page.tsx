import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/common/listing-page/ListingPage";
import { getHotels } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { gridLabels, hotelItem } from "@/utils/listing-items";
import { alternates } from "@/utils/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/hotels">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.hotelsTitle, description: dict.meta.hotelsDescription, alternates: alternates(lang, "/hotels") };
}

export default async function HotelsPage({ params }: PageProps<"/[lang]/hotels">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, hotels] = await Promise.all([getDictionary(lang), getHotels(lang)]);

  return (
    <ListingPage
      hero={{ kicker: dict.tour.hotelsKicker, title: dict.hotels.title, image: "/images/pages/hotels-hero.webp" }}
      items={hotels.map((hotel) => hotelItem(hotel, lang, dict))}
      labels={gridLabels(dict, dict.offers.all, dict.hotels.sort)}
      locale={lang}
      dict={dict}
    />
  );
}
