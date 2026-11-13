import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutSections } from "@/components/about/about-sections/AboutSections";
import { AboutValues } from "@/components/about/about-values/AboutValues";
import { CtaBanner, CtaBannerLink } from "@/components/common/cta-banner/CtaBanner";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { Icon } from "@/components/ui/icon/Icon";
import { SectionHeader } from "@/components/ui/section-header/SectionHeader";
import { getAboutSections } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import "./about-page.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.aboutTitle, description: dict.meta.aboutDescription, alternates: alternates(lang, "/about") };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, sections] = await Promise.all([getDictionary(lang), getAboutSections(lang)]);
  const t = dict.about;

  return (
    <>
      <PageHero kicker={t.kicker} title={t.title} image="/images/home/infrastructure.webp" />

      <section className="about-page-intro">
        <div className="container about-page-intro-inner">
          <h2 className="about-page-intro-title">{t.introTitle}</h2>
          <div className="about-page-intro-copy">
            <p className="about-page-intro-text">{t.introText}</p>
            <p className="about-page-intro-text">{t.note}</p>
          </div>
        </div>
      </section>

      <section className="about-page-numbers" aria-labelledby="about-stats">
        <div className="container">
          <SectionHeader id="about-stats" kicker={dict.home.stats.kicker} title={t.statsTitle} />
          <dl className="about-page-stats">
            {dict.home.stats.items.map((item) => (
              <div key={item.label} className="about-page-stat">
                <dt className="about-page-stat-value">{item.value}</dt>
                <dd className="about-page-stat-label">{item.label}</dd>
              </div>
            ))}
          </dl>
          <AboutValues dict={dict} />
        </div>
      </section>

      {sections.length > 0 && (
        <section className="about-page-story" aria-labelledby="about-story">
          <div className="container">
            <div className="about-page-story-head">
              <SectionHeader id="about-story" kicker={t.sectionsKicker} title={t.storyTitle} />
              <p className="about-page-story-text">{t.story}</p>
            </div>
            <AboutSections sections={sections} />
          </div>
        </section>
      )}

      <section className="about-page-cta">
        <div className="container">
          <CtaBanner
            eyebrow={t.ctaEyebrow}
            title={dict.cta.title}
            text={dict.cta.text}
            image="/images/pages/cta-custom.webp"
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
