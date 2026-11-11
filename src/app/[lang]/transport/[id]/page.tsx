import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OfferBookingCard } from "@/components/common/offer-booking-card/OfferBookingCard";
import { OfferCard } from "@/components/common/offer-card/OfferCard";
import type { OfferFact } from "@/utils/offers";
import { BackLink } from "@/components/ui/back-link/BackLink";
import { PhotoGallery } from "@/components/ui/photo-gallery/PhotoGallery";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { getTransports } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { fill, offerPrice } from "@/utils/offers";
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
  const others = cars.filter((c) => c.id !== car.id).slice(0, 3);

  const specs: { icon: IconName; label: string; value: string }[] = [
    { icon: "users", label: t.seatsLabel, value: String(car.seats) },
    { icon: "user", label: t.driverLabel, value: car.hasDriver ? t.yes : t.no },
    { icon: "check", label: t.acLabel, value: car.hasAirConditioner ? t.yes : t.no },
    ...(car.model ? [{ icon: "car" as IconName, label: t.modelLabel, value: car.model }] : []),
    ...(car.year ? [{ icon: "calendar" as IconName, label: t.yearLabel, value: String(car.year) }] : []),
    ...(car.color ? [{ icon: "gem" as IconName, label: t.colorLabel, value: car.color }] : []),
  ];

  return (
    <article className="transport-page">
      <div className="container">
        <BackLink href={`/${lang}/transport`} label={t.back} className="transport-page-back" />

        <header className="transport-page-head">
          <div className="transport-page-meta">
            {car.subtitle && (
              <span className="transport-page-place">
                <Icon name="car" size={15} />
                {car.subtitle}
              </span>
            )}
          </div>
          <h1 className="transport-page-title">{car.name}</h1>
        </header>

        <PhotoGallery
          images={[car.image, ...car.gallery]}
          name={car.name}
          fit="contain"
          labels={{ photos: dict.hotels.photos, photo: dict.hotels.photo, close: dict.a11y.close, prev: dict.a11y.prev, next: dict.a11y.next }}
        />

        <div className="transport-page-layout">
          <div className="transport-page-main">
            <section className="transport-page-section" aria-labelledby="car-specs">
              <h2 id="car-specs" className="transport-page-heading">
                {t.specs}
              </h2>
              <ul className="transport-page-specs">
                {specs.map((spec) => (
                  <li key={spec.label} className="transport-page-spec">
                    <span className="transport-page-spec-icon">
                      <Icon name={spec.icon} size={20} />
                    </span>
                    <span className="transport-page-spec-label">{spec.label}</span>
                    <span className="transport-page-spec-value">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="transport-page-section" aria-labelledby="car-about">
              <h2 id="car-about" className="transport-page-heading">
                {t.about}
              </h2>
              <p className="transport-page-text">{car.description || t.aboutFallback}</p>
            </section>
          </div>

          <OfferBookingCard
            price={car.price}
            unit={car.unit}
            askPrompt={t.askPrompt.replace("{name}", car.name)}
            locale={lang}
            dict={dict}
          />
        </div>
      </div>

      {others.length > 0 && (
        <section className="section section-soft" aria-labelledby="car-others">
          <Reveal className="container">
            <div className="transport-page-others-head">
              <h2 id="car-others" className="transport-page-others-title">
                {t.other}
              </h2>
              <Link href={`/${lang}/transport`} className="transport-page-others-link">
                {t.back}
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <ul className="offer-card-grid">
              {others.map((item) => {
                const facts: OfferFact[] = [
                  { icon: "users", label: fill(t.seats, item.seats) },
                  { icon: "user", label: item.hasDriver ? t.driver : t.noDriver },
                ];
                return (
                  <li key={item.id}>
                    <OfferCard
                      image={item.image}
                      title={item.name}
                      subtitle={item.subtitle}
                      facts={facts}
                      text={item.description}
                      price={offerPrice(item.price, item.unit, lang, dict)}
                      href={`/${lang}/transport/${item.id}`}
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
