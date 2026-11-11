import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqHelp } from "@/components/faq/faq-help/FaqHelp";
import { FaqList } from "@/components/faq/faq-list/FaqList";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { kg } from "@/data/images";
import { getFaqs } from "@/utils/api/catalog";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import "./faq-page.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.faqTitle, description: dict.meta.faqDescription, alternates: alternates(lang, "/faq") };
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, faqs] = await Promise.all([getDictionary(lang), getFaqs(lang)]);
  const t = dict.home.faq;
  const questions = faqs.length > 0 ? faqs : t.items;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero kicker={t.kicker} title={t.title} text={t.page.text} image={kg("ala-archa")} />
      <section className="section">
        <Reveal className="container faq-page">
          <FaqList items={questions} numbered />
          <FaqHelp
            title={t.page.helpTitle}
            text={t.page.helpText}
            askLabel={t.page.ask}
            askHref={`/${lang}/chat`}
            contactLabel={t.page.contact}
            contactHref={`/${lang}/contact`}
          />
        </Reveal>
      </section>
    </>
  );
}
