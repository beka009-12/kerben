import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingCard } from "@/components/common/booking-card/BookingCard";
import { DetailAbout, type DetailFact } from "@/components/common/detail-about/DetailAbout";
import { DetailLayout } from "@/components/common/detail-layout/DetailLayout";
import { DetailSection } from "@/components/common/detail-section/DetailSection";
import type { TourHeaderMeta } from "@/components/tour/tour-header/TourHeader";
import { getTransports } from "@/utils/api/catalog";
import { bookingLabels, dateField, getBookingExtras } from "@/utils/contact/booking-extras";
import { formatPrice } from "@/utils/format";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { carItem, seatsLabel } from "@/utils/listing-items";
import { alternates } from "@/utils/seo";
import "./transport-page.css";

export async function generateStaticParams() {
  const cars = await getTransports("ru");
  return [{ id: String(cars[0]?.id ?? 0) }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/transport/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const car = (await getTransports(lang)).find((c) => c.id === Number(id));
  if (!car) return {};
  return {
    title: car.name,
    description: (car.description || car.subtitle).slice(0, 160),
    alternates: alternates(lang, `/transport/${id}`),
    openGraph: { title: car.name, images: [{ url: car.image }] },
  };
}

export default function TransportDetailPage({ params }: PageProps<"/[lang]/transport/[id]">) {
  return (
    <Suspense fallback={<div className="transport-page-skeleton" aria-busy="true" />}>
      <TransportContent params={params} />
    </Suspense>
  );
}

async function TransportContent({ params }: { params: PageProps<"/[lang]/transport/[id]">["params"] }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, cars] = await Promise.all([getDictionary(lang), getTransports(lang)]);
  const car = cars.find((c) => c.id === Number(id));
  if (!car) notFound();

  const t = dict.transport;
  const extras = await getBookingExtras(lang, dict, car.price, false);
  const meta: TourHeaderMeta[] = [
    ...(car.seats > 0 ? [{ icon: "users" as const, text: seatsLabel(car.seats, lang, dict) }] : []),
    { text: car.hasDriver ? t.driver : t.noDriver },
  ];
  const specs: DetailFact[] = [
    { label: t.seatsLabel, value: String(car.seats) },
    { label: t.driverLabel, value: car.hasDriver ? t.yes : t.no },
    { label: t.acLabel, value: car.hasAirConditioner ? t.yes : t.no },
    ...(car.model ? [{ label: t.modelLabel, value: car.model }] : []),
    ...(car.year ? [{ label: t.yearLabel, value: String(car.year) }] : []),
    ...(car.color ? [{ label: t.colorLabel, value: car.color }] : []),
  ];

  return (
    <DetailLayout
      header={{ title: car.name, kicker: t.title, meta, section: { href: `/${lang}/transport`, label: t.title } }}
      images={[car.image, ...car.gallery]}
      aside={
        <BookingCard
          title={car.name}
          price={car.price > 0 ? formatPrice(car.price, lang) : null}
          fields={[dateField("from", t.dateFrom), dateField("to", t.dateTo)]}
          contacts={extras.contacts}
          chatHref={`/${lang}/chat`}
          askHref={`/${lang}/chat?ask=${encodeURIComponent(t.askPrompt.replace("{name}", car.name))}`}
          labels={bookingLabels(dict, dict.units[car.unit], { book: dict.offers.request, notes: true })}
        />
      }
      others={{
        title: t.other,
        link: { href: `/${lang}/transport`, label: t.back },
        items: cars
          .filter((c) => c.id !== car.id)
          .slice(0, 3)
          .map((item) => carItem(item, lang, dict)),
      }}
      locale={lang}
      dict={dict}
    >
      <DetailAbout title={t.specs} facts={specs} />
      <DetailSection id="about" title={t.about}>
        <p className="transport-page-text">{car.description || t.aboutFallback}</p>
      </DetailSection>
    </DetailLayout>
  );
}
