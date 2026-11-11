import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyOffers } from "@/components/common/empty-offers/EmptyOffers";
import { OfferCard } from "@/components/common/offer-card/OfferCard";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { ButtonLink } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { pagePhoto } from "@/data/images";
import { getTrekkings } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { fill, offerPrice } from "@/utils/offers";
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
  const t = dict.trekking;

  return (
    <>
      <PageHero title={t.title} image={pagePhoto("ala-archa-gorge-hd")} />
      <section className="section">
        <Reveal className="container">
          {treks.length === 0 ? (
            <EmptyOffers
              icon="backpack"
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
              {treks.map((trek) => (
                <li key={trek.id}>
                  <OfferCard
                    image={trek.image}
                    title={trek.title}
                    href={`/${lang}/trekking/${trek.id}`}
                    facts={[
                      ...(trek.days ? [{ icon: "clock" as const, label: fill(t.days, trek.days) }] : []),
                      ...(trek.program.length ? [{ icon: "route" as const, label: dict.offers.program }] : []),
                    ]}
                    text={trek.description}
                    price={offerPrice(trek.price, trek.unit, lang, dict)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </section>
    </>
  );
}
