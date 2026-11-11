import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OfferBookingCard } from "@/components/common/offer-booking-card/OfferBookingCard";
import { OfferCard } from "@/components/common/offer-card/OfferCard";
import type { OfferFact } from "@/utils/offers";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { PhotoGallery } from "@/components/ui/photo-gallery/PhotoGallery";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { getHelicopterTour, getHelicopterTours } from "@/utils/api/catalog";
import { formatPrice } from "@/utils/format";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { fill, offerPrice } from "@/utils/offers";
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
  const others = flights.filter((item) => item.id !== flight.id).slice(0, 3);
  const stats: { icon: IconName; label: string; value: string }[] = [
    ...(flight.minutes ? [{ icon: "clock" as IconName, label: t.duration, value: fill(t.minutes, flight.minutes) }] : []),
    ...(flight.passengers ? [{ icon: "users" as IconName, label: t.passengersLabel, value: fill(t.upTo, flight.passengers) }] : []),
    ...(flight.price > 0
      ? [{ icon: "ticket" as IconName, label: t.priceLabel, value: `${formatPrice(flight.price, lang)} / ${dict.units[flight.unit]}` }]
      : []),
  ];
  const stops = flight.route ? flight.route.split(" → ") : [];

  return (
    <article className="helicopter-page">

      <header className="helicopter-hero">
        <Image src={flight.image} alt="" fill sizes="100vw" loading="eager" fetchPriority="high" className="helicopter-hero-image" />
        <div className="helicopter-hero-shade" />
        <div className="container helicopter-hero-inner">
          <Link href={`/${lang}/helicopter`} className="helicopter-hero-back">
            <Icon name="arrowLeft" size={16} />
            {t.back}
          </Link>
          <div className="helicopter-hero-copy">
            <p className="helicopter-hero-kicker">
              <Icon name="helicopter" size={18} />
              {t.kickerOne}
            </p>
            <h1 className="helicopter-hero-title">{flight.title}</h1>
            {stops.length > 1 && (
              <ol className="helicopter-route" aria-label={t.routeLabel}>
                {stops.map((stop, i) => (
                  <li key={`${stop}-${i}`} className={i === 0 ? "helicopter-route-stop helicopter-route-stop-first" : "helicopter-route-stop"}>
                    <span className="helicopter-route-dot" />
                    {stop}
                  </li>
                ))}
              </ol>
            )}
          </div>
          {stats.length > 0 && (
            <dl className="helicopter-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="helicopter-stat">
                  <dt className="helicopter-stat-label">
                    <Icon name={stat.icon} size={16} />
                    {stat.label}
                  </dt>
                  <dd className="helicopter-stat-value">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      <div className="container helicopter-page-layout">
        <div className="helicopter-page-main">
          <section className="helicopter-page-section" aria-labelledby="flight-about">
            <h2 id="flight-about" className="helicopter-page-heading">
              {t.about}
            </h2>
            <p className="helicopter-page-text">{flight.description || t.aboutFallback}</p>
          </section>

          <section className="helicopter-page-section" aria-labelledby="flight-steps">
            <h2 id="flight-steps" className="helicopter-page-heading">
              {t.stepsTitle}
            </h2>
            <ol className="helicopter-steps">
              {t.steps.map((step, i) => (
                <li key={step.title} className="helicopter-step">
                  <span className="helicopter-step-number">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="helicopter-step-title">{step.title}</h3>
                  <p className="helicopter-step-text">{step.text}</p>
                </li>
              ))}
            </ol>
            <aside className="helicopter-weather">
              <span className="helicopter-weather-icon">
                <Icon name="weather" size={22} />
              </span>
              <span className="helicopter-weather-copy">
                <strong className="helicopter-weather-title">{t.weatherTitle}</strong>
                <span className="helicopter-weather-text">{t.weatherText}</span>
              </span>
            </aside>
          </section>

          <section className="helicopter-page-section" aria-labelledby="flight-photos">
            <h2 id="flight-photos" className="helicopter-page-heading">
              {t.photos}
            </h2>
            <PhotoGallery
              images={[flight.image, ...flight.gallery]}
              name={flight.title}
              labels={{ photos: dict.hotels.photos, photo: dict.hotels.photo, close: dict.a11y.close, prev: dict.a11y.prev, next: dict.a11y.next }}
            />
          </section>
        </div>

        <div className="helicopter-page-aside">
          <OfferBookingCard
            price={flight.price}
            unit={flight.unit}
            badge={flight.minutes ? fill(t.minutes, flight.minutes) : undefined}
            askPrompt={t.askPrompt.replace("{name}", flight.title)}
            locale={lang}
            dict={dict}
          />
        </div>
      </div>

      {others.length > 0 && (
        <section className="section section-soft" aria-labelledby="flight-others">
          <Reveal className="container">
            <div className="helicopter-page-others-head">
              <h2 id="flight-others" className="helicopter-page-others-title">
                {t.other}
              </h2>
              <Link href={`/${lang}/helicopter`} className="helicopter-page-others-link">
                {t.back}
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <ul className="offer-card-grid">
              {others.map((item) => {
                const facts: OfferFact[] = [
                  ...(item.minutes ? [{ icon: "clock" as const, label: fill(t.minutes, item.minutes) }] : []),
                  ...(item.passengers ? [{ icon: "users" as const, label: fill(t.passengers, item.passengers) }] : []),
                ];
                return (
                  <li key={item.id}>
                    <OfferCard
                      image={item.image}
                      title={item.title}
                      subtitle={item.route || undefined}
                      facts={facts}
                      text={item.description}
                      price={offerPrice(item.price, item.unit, lang, dict)}
                      href={`/${lang}/helicopter/${item.id}`}
                    />
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </section>
      )}
    </article>
  );
}
