import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { TourCard } from "@/components/tours/tour-card/TourCard";
import { Icon } from "@/components/ui/icon/Icon";
import { EXPERIENCES } from "@/data/experiences";
import { getTours } from "@/utils/api/tours";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import { defaultFilters, filterTours, THEMES, type Theme } from "@/utils/tour-filters";
import "./experience-page.css";

const isTheme = (value: string): value is Theme => (THEMES as readonly string[]).includes(value);

export function generateStaticParams() {
  return THEMES.map((theme) => ({ theme }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/experiences/[theme]">): Promise<Metadata> {
  const { lang, theme } = await params;
  if (!hasLocale(lang) || !isTheme(theme)) return {};
  const item = (await getDictionary(lang)).home.experiences.items[THEMES.indexOf(theme)];
  return item ? { title: item.title, description: item.text, alternates: alternates(lang, `/experiences/${theme}`) } : {};
}

export default function ExperiencePage({ params }: PageProps<"/[lang]/experiences/[theme]">) {
  return (
    <Suspense fallback={<div className="experience-page-skeleton" aria-busy="true" />}>
      <ExperienceContent params={params} />
    </Suspense>
  );
}

async function ExperienceContent({ params }: { params: PageProps<"/[lang]/experiences/[theme]">["params"] }) {
  const { lang, theme } = await params;
  if (!hasLocale(lang) || !isTheme(theme)) notFound();
  const [dict, tours] = await Promise.all([getDictionary(lang), getTours(lang)]);
  const t = dict.home.experiences;
  const index = THEMES.indexOf(theme);
  const item = t.items[index];
  const matched = filterTours(tours, { ...defaultFilters, theme });
  const others = EXPERIENCES.map((experience, i) => ({ ...experience, item: t.items[i] })).filter((other) => other.theme !== theme && other.item);

  return (
    <>
      <PageHero kicker={t.kicker} title={item.title} text={item.text} image={EXPERIENCES[index].image}>
        <Link href={`/${lang}#experiences`} className="experience-page-back">
          <Icon name="arrowLeft" size={18} />
          {t.back}
        </Link>
      </PageHero>

      <section className="section" aria-labelledby="experience-tours">
        <div className="container experience-page-body">
          <div className="experience-page-head">
            <h2 id="experience-tours" className="experience-page-title">
              {t.tours}
            </h2>
            {matched.length > 0 && <span className="experience-page-count">{t.toursCount.replace("{n}", String(matched.length))}</span>}
          </div>
          {matched.length > 0 ? (
            <ul className="experience-page-grid">
              {matched.map((tour, i) => (
                <li key={tour.slug}>
                  <TourCard tour={tour} locale={lang} dict={dict} eager={i < 3} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="experience-page-empty">
              <Icon name="compass" size={32} />
              <p>{t.empty}</p>
              <div className="experience-page-empty-actions">
                <Link href={`/${lang}/chat?ask=${encodeURIComponent(item.title)}`} className="experience-page-button">
                  {t.emptyCta}
                </Link>
                <Link href={`/${lang}/tours`} className="experience-page-link">
                  {t.allTours}
                  <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section-soft" aria-labelledby="experience-others">
        <div className="container">
          <h2 id="experience-others" className="experience-page-title">
            {t.others}
          </h2>
          <ul className="experience-page-others">
            {others.map((other) => (
              <li key={other.theme}>
                <Link href={`/${lang}/experiences/${other.theme}`} className="experience-page-other">
                  <Image src={other.image} alt="" fill sizes="(min-width: 900px) 20vw, 50vw" className="experience-page-other-image" />
                  <span className="experience-page-other-shade" />
                  <span className="experience-page-other-name">
                    {other.item.title}
                    <Icon name="arrowRight" size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
