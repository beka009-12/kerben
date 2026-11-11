import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyOffers } from "@/components/common/empty-offers/EmptyOffers";
import { OfferCard } from "@/components/common/offer-card/OfferCard";
import type { OfferFact } from "@/utils/offers";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { ButtonLink } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { pagePhoto } from "@/data/images";
import { getTransports } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { fill, offerPrice } from "@/utils/offers";
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
  const t = dict.transport;

  return (
    <>
      <PageHero title={t.title} image={pagePhoto("mountain-valley-hd")} />
      <section className="section">
        <Reveal className="container">
          {cars.length === 0 ? (
            <EmptyOffers
              icon="car"
              title={dict.offers.emptyTitle}
              text={dict.offers.emptyText}
              action={
                <ButtonLink href={`/${lang}/chat`} size="lg">
                  <Icon name="sparkles" size={18} />
                  {dict.offers.request}
                </ButtonLink>
              }
            />
          ) : (
            <ul className="offer-card-grid">
              {cars.map((car) => {
                const facts: OfferFact[] = [
                  { icon: "users", label: fill(t.seats, car.seats) },
                  { icon: "user", label: car.hasDriver ? t.driver : t.noDriver },
                  ...(car.hasAirConditioner ? [{ icon: "check" as const, label: t.ac }] : []),
                  ...(car.year ? [{ icon: "calendar" as const, label: fill(t.year, car.year) }] : []),
                ];
                return (
                  <li key={car.id}>
                    <OfferCard
                      image={car.image}
                      title={car.name}
                      subtitle={car.subtitle}
                      facts={facts}
                      text={car.description}
                      price={offerPrice(car.price, car.unit, lang, dict)}
                      href={`/${lang}/transport/${car.id}`}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Reveal>
      </section>
    </>
  );
}
