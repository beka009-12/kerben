import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { PickButton } from "@/components/ui/pick-button/PickButton";
import { trekkingPick } from "@/utils/trip/trip-picks";
import { TourItinerary } from "@/components/tour/tour-itinerary/TourItinerary";
import { PhotoGallery } from "@/components/ui/photo-gallery/PhotoGallery";
import { Icon } from "@/components/ui/icon/Icon";
import { getTrekking, getTrekkings } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { fill, offerPrice } from "@/utils/offers";
import { alternates } from "@/utils/seo";
import "./trekking-page.css";

type Params = PageProps<"/[lang]/trekking/[id]">["params"];

export async function generateStaticParams() {
  const treks = await getTrekkings("ru");
  return [{ id: String(treks[0]?.id ?? 0) }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/trekking/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const trek = await getTrekking(Number(id), lang);
  if (!trek) return {};
  return {
    title: trek.title,
    description: trek.description.slice(0, 160),
    alternates: alternates(lang, `/trekking/${id}`),
    openGraph: { title: trek.title, images: [{ url: trek.image }] },
  };
}

export default function TrekkingRoutePage({ params }: PageProps<"/[lang]/trekking/[id]">) {
  return (
    <Suspense fallback={<div className="trekking-page-skeleton" aria-busy="true" />}>
      <TrekkingContent params={params} />
    </Suspense>
  );
}

async function TrekkingContent({ params }: { params: Params }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, trek] = await Promise.all([getDictionary(lang), getTrekking(Number(id), lang)]);
  if (!trek) notFound();
  const t = dict.trekking;
  const price = offerPrice(trek.price, trek.unit, lang, dict);

  return (
    <>
      <PageHero kicker={t.title} title={trek.title} image={trek.image} />
      <div className="container trekking-page">
        <div className="trekking-page-main">
          <Link href={`/${lang}/trekking`} className="trekking-page-back">
            <Icon name="arrowLeft" size={16} />
            {dict.offers.back}
          </Link>

          {trek.description && (
            <section aria-labelledby="trek-about">
              <h2 id="trek-about" className="trekking-page-title">
                {dict.offers.about}
              </h2>
              <p className="trekking-page-text">{trek.description}</p>
            </section>
          )}

          {trek.program.length > 0 && (
            <TourItinerary itinerary={trek.program.map((step) => ({ ...step, coords: [0, 0] as [number, number] }))} />
          )}

          {trek.gallery.length > 0 && (
            <section aria-labelledby="trek-gallery">
              <h2 id="trek-gallery" className="trekking-page-title">
                {dict.offers.gallery}
              </h2>
              <PhotoGallery
                images={[trek.image, ...trek.gallery]}
                name={trek.title}
                labels={{ photos: dict.hotels.photos, photo: dict.hotels.photo, close: dict.a11y.close, prev: dict.a11y.prev, next: dict.a11y.next }}
              />
            </section>
          )}
        </div>

        <aside className="trekking-page-side" aria-label={dict.offers.request}>
          {trek.days && (
            <p className="trekking-page-fact">
              <Icon name="clock" size={18} />
              {fill(t.days, trek.days)}
            </p>
          )}
          {price && <p className="trekking-page-price">{price}</p>}
          <PickButton pick={trekkingPick(trek, lang, dict.units)} size="lg" block />
          <p className="trekking-page-note">{dict.offers.note}</p>
        </aside>
      </div>
    </>
  );
}
