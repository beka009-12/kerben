import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { CtaBanner, CtaBannerLink } from "@/components/common/cta-banner/CtaBanner";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { Icon } from "@/components/ui/icon/Icon";
import { ATTRACTIONS } from "@/data/attractions";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import "./attractions-page.css";

/** Без фото место занимает всю ширину; с фото — ряды чередуют сторону снимка */
function articleClass(hasImage: boolean, index: number): string {
  if (!hasImage) return "attraction attraction-solo";
  return index % 2 ? "attraction attraction-flip" : "attraction";
}

/** Не даём заголовку рваться на дефисе: «Ала-|Арча», «Сары-|Челек» */
function KeepHyphens({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      {i > 0 && " "}
      {word.includes("-") ? <span className="attraction-nowrap">{word}</span> : word}
    </Fragment>
  ));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/attractions">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.attractionsTitle,
    description: dict.meta.attractionsDescription,
    alternates: alternates(lang, "/attractions"),
  };
}

export default async function AttractionsPage({ params }: PageProps<"/[lang]/attractions">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.attractions;
  const places = ATTRACTIONS.map((place) => ({ ...place, ...t.items[place.slug] }));

  return (
    <>
      <PageHero title={t.title} text={t.text} image="/images/hero/jeti-oguz-hd.webp" />

      <nav className="attractions-index" aria-label={t.indexLabel}>
        <ul className="container attractions-index-list">
          {places.map((place) => (
            <li key={place.slug}>
              <a href={`#${place.slug}`} className="attractions-index-link">
                {place.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container attractions-list">
        {places.map((place, i) => (
          <article key={place.slug} id={place.slug} className={articleClass(Boolean(place.image), i)} aria-labelledby={`${place.slug}-name`}>
            {place.image && (
              <div className={place.portrait ? "attraction-media attraction-media-portrait" : "attraction-media"}>
                <Image src={place.image} alt={place.name} fill sizes="(min-width: 1024px) 600px, 100vw" className="attraction-image" />
              </div>
            )}

            <div className="attraction-body">
              <div className="attraction-head">
                <p className="attraction-region">
                  <Icon name="mapPin" size={16} />
                  {place.region}
                </p>
                <h2 id={`${place.slug}-name`} className="attraction-name">
                  <KeepHyphens text={place.name} />
                </h2>
              </div>
              <div className="attraction-copy">
                <div className="attraction-text">
                  {place.text.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {"points" in place && (
                  <dl className="attraction-points">
                    {place.points.map((point) => (
                      <div key={point.title} className="attraction-point">
                        <dt>{point.title}</dt>
                        <dd>{point.text}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <ul className="attraction-facts">
                  {place.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
                <Link href={`/${lang}/chat?ask=${encodeURIComponent(t.planAsk.replace("{name}", place.name))}`} className="attraction-plan">
                  <Icon name="sparkle" size={18} />
                  {t.plan}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="attractions-cta">
        <div className="container">
          <CtaBanner
            title={t.ctaTitle}
            text={t.ctaText}
            image="/images/pages/cta-tour.webp"
            trust={dict.tour.ctaTrust}
            actions={
              <>
                <CtaBannerLink href={`/${lang}/tours`} variant="primary">
                  {dict.hero.primary}
                  <Icon name="arrowRight" size={18} />
                </CtaBannerLink>
                <CtaBannerLink href={`/${lang}/chat`} variant="glass">
                  <Icon name="sparkle" size={18} />
                  {dict.ai.tourButton}
                </CtaBannerLink>
              </>
            }
          />
        </div>
      </section>
    </>
  );
}
