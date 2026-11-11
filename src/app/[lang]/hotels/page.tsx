import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyOffers } from "@/components/common/empty-offers/EmptyOffers";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { HotelCard } from "@/components/hotels/hotel-card/HotelCard";
import { ButtonLink } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { pagePhoto } from "@/data/images";
import { getHotels } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import "./hotels-page.css";

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
  const t = dict.hotels;

  return (
    <>
      <PageHero title={t.title} image={pagePhoto("issyk-kul-shore-hd")} />
      <section className="section">
        <Reveal className="container">
          <h2 className="visually-hidden">{t.title}</h2>
          {hotels.length === 0 ? (
            <EmptyOffers
              icon="bed"
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
            <ul className="hotels-page-grid">
              {hotels.map((hotel) => (
                <li key={hotel.id}>
                  <HotelCard hotel={hotel} locale={lang} dict={dict} />
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </section>
    </>
  );
}
