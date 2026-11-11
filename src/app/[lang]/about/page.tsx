import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutSections } from "@/components/about/about-sections/AboutSections";
import { AboutValues } from "@/components/about/about-values/AboutValues";
import { CtaBanner } from "@/components/common/cta-banner/CtaBanner";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { StatsBand } from "@/components/home/stats-band/StatsBand";
import { ButtonLink } from "@/components/ui/button/Button";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { kg, pagePhoto } from "@/data/images";
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
      <PageHero kicker={t.kicker} title={t.title} text={t.text} image={pagePhoto("glacier-lake")}>
        <p className="about-page-note">{t.note}</p>
      </PageHero>
      <StatsBand dict={dict} locale={lang} stats={null} />
      <section className="section section-flush-top">
        <Reveal className="container">
          <AboutValues dict={dict} />
        </Reveal>
      </section>
      {sections.length > 0 && (
        <section className="section section-flush-top">
          <Reveal className="container">
            <AboutSections kicker={t.sectionsKicker} sections={sections} />
          </Reveal>
        </section>
      )}
      <section className="section section-flush-top">
        <div className="container">
          <CtaBanner
            title={dict.cta.title}
            text={dict.cta.text}
            image={kg("issyk-kul-beach")}
            action={
              <ButtonLink href={`/${lang}/contact`} variant="light" size="lg">
                {dict.nav.contact}
              </ButtonLink>
            }
          />
        </div>
      </section>
    </>
  );
}
