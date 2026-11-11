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
import { getHelicopterTours } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { fill, offerPrice } from "@/utils/offers";
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
  const t = dict.helicopter;

  return (
    <>
      <PageHero title={t.title} image={pagePhoto("green-peaks-hd")} />
      <section className="section">
        <Reveal className="container">
          {flights.length === 0 ? (
            <EmptyOffers
              icon="send"
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
              {flights.map((flight) => {
                const facts: OfferFact[] = [
                  ...(flight.minutes ? [{ icon: "clock" as const, label: fill(t.minutes, flight.minutes) }] : []),
                  ...(flight.passengers ? [{ icon: "users" as const, label: fill(t.passengers, flight.passengers) }] : []),
                  ...(flight.route ? [{ icon: "route" as const, label: flight.route }] : []),
                ];
                return (
                  <li key={flight.id}>
                    <OfferCard
                      image={flight.image}
                      title={flight.title}
                      facts={facts}
                      text={flight.description}
                      price={offerPrice(flight.price, flight.unit, lang, dict)}
                      href={`/${lang}/helicopter/${flight.id}`}
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
