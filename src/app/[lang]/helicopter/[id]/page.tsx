import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingCard } from "@/components/common/booking-card/BookingCard";
import { DetailLayout } from "@/components/common/detail-layout/DetailLayout";
import { DetailSection } from "@/components/common/detail-section/DetailSection";
import type { TourHeaderMeta } from "@/components/tour/tour-header/TourHeader";
import { getHelicopterTour, getHelicopterTours } from "@/utils/api/catalog";
import { bookingLabels, countField, dateField, getBookingExtras } from "@/utils/contact/booking-extras";
import { formatPrice } from "@/utils/format";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { flightItem } from "@/utils/listing-items";
import { fill } from "@/utils/offers";
import { alternates } from "@/utils/seo";
import "./helicopter-page.css";

type Params = PageProps<"/[lang]/helicopter/[id]">["params"];

export async function generateStaticParams() {
  const flights = await getHelicopterTours("ru");
  return [{ id: String(flights[0]?.id ?? 0) }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/helicopter/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const flight = await getHelicopterTour(lang, Number(id));
  if (!flight) return {};
  return {
    title: flight.title,
    description: (flight.description || flight.route).slice(0, 160),
    alternates: alternates(lang, `/helicopter/${id}`),
    openGraph: { title: flight.title, images: [{ url: flight.image }] },
  };
}

export default function HelicopterDetailPage({ params }: PageProps<"/[lang]/helicopter/[id]">) {
  return (
    <Suspense fallback={<div className="helicopter-page-skeleton" aria-busy="true" />}>
      <HelicopterContent params={params} />
    </Suspense>
  );
}

async function HelicopterContent({ params }: { params: Params }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, flights] = await Promise.all([getDictionary(lang), getHelicopterTours(lang)]);
  const flight = flights.find((item) => item.id === Number(id));
  if (!flight) notFound();

  const t = dict.helicopter;
  const extras = await getBookingExtras(lang, dict, flight.price, false);
  const minutes = flight.minutes ? fill(t.minutes, flight.minutes) : null;
  const meta: TourHeaderMeta[] = [
    ...(minutes ? [{ icon: "clock" as const, text: minutes }] : []),
    ...(flight.route ? [{ icon: "mapPin" as const, text: flight.route }] : []),
  ];

  return (
    <DetailLayout
      header={{ title: flight.title, kicker: t.title, meta, section: { href: `/${lang}/helicopter`, label: t.title } }}
      images={[flight.image, ...flight.gallery]}
      caption={t.photos}
      aside={
        <BookingCard
          title={flight.title}
          price={flight.price > 0 ? formatPrice(flight.price, lang) : null}
          meta={minutes ? { icon: "clock", text: minutes } : undefined}
          fields={[dateField("date", t.date), countField("passengers", t.passengersField, t.peopleForms, lang)]}
          contacts={extras.contacts}
          chatHref={`/${lang}/chat`}
          askHref={`/${lang}/chat?ask=${encodeURIComponent(t.askPrompt.replace("{name}", flight.title))}`}
          labels={bookingLabels(dict, dict.units[flight.unit], { book: dict.offers.request, notes: true })}
        />
      }
      others={{
        title: t.other,
        link: { href: `/${lang}/helicopter`, label: t.back },
        items: flights
          .filter((item) => item.id !== flight.id)
          .slice(0, 3)
          .map((item) => flightItem(item, lang, dict)),
      }}
      locale={lang}
      dict={dict}
    >
      <DetailSection id="about" title={t.about}>
        <p className="helicopter-page-text">{flight.description || t.aboutFallback}</p>
      </DetailSection>

      <DetailSection id="steps" title={t.stepsTitle}>
        <ol className="helicopter-steps">
          {t.steps.map((step, i) => (
            <li key={step.title} className="helicopter-step">
              <span className="helicopter-step-number">{String(i + 1).padStart(2, "0")}</span>
              <span className="helicopter-step-copy">
                <span className="helicopter-step-title">{step.title}</span>
                <span className="helicopter-step-text">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </DetailSection>

      <aside className="helicopter-weather">
        <p className="helicopter-weather-title">{t.weatherTitle}</p>
        <p className="helicopter-weather-text">{t.weatherText}</p>
      </aside>
    </DetailLayout>
  );
}
