import { notFound } from "next/navigation";
import { CentralAsia } from "@/components/home/central-asia/CentralAsia";
import { CustomTrip } from "@/components/home/custom-trip/CustomTrip";
import { ExperienceGrid } from "@/components/home/experience-grid/ExperienceGrid";
import { Faq } from "@/components/home/faq/Faq";
import { Hero } from "@/components/home/hero/Hero";
import { Infrastructure } from "@/components/home/infrastructure/Infrastructure";
import { PlanCta } from "@/components/home/plan-cta/PlanCta";
import { PopularDestinations } from "@/components/home/popular-destinations/PopularDestinations";
import { Seasons } from "@/components/home/seasons/Seasons";
import { PeopleNumbers } from "@/components/home/people-numbers/PeopleNumbers";
import { siteConfig } from "@/config/site";
import { EXPERIENCES } from "@/data/experiences";
import { getFaqs } from "@/utils/api/catalog";
import { getContacts } from "@/utils/api/contacts";
import { getTours } from "@/utils/api/tours";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { inKyrgyzstan } from "@/utils/markers";

const home = (name: string) => `/images/home/${name}.webp`;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, tours, faqs, contacts] = await Promise.all([getDictionary(lang), getTours(lang), getFaqs(lang), getContacts(lang)]);

  const popular = [...tours.filter((tour) => inKyrgyzstan(tour.coords)), ...tours.filter((tour) => !inKyrgyzstan(tour.coords))].slice(0, 9);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.name,
    url: `${siteConfig.url}/${lang}`,
    ...(contacts.email ? { email: contacts.email } : {}),
    ...(contacts.phone ? { telephone: contacts.phone } : {}),
    areaServed: ["Kyrgyzstan", "Kazakhstan", "Uzbekistan"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero locale={lang} dict={dict} />
      <PeopleNumbers dict={dict} locale={lang} stats={null} />
      {popular.length > 0 && <PopularDestinations tours={popular} locale={lang} dict={dict} />}
      <CentralAsia locale={lang} dict={dict} />
      <ExperienceGrid
        images={EXPERIENCES.map((item) => item.image)}
        themes={EXPERIENCES.map((item) => item.theme)}
        locale={lang}
        dict={dict}
      />
      <CustomTrip image={home("custom-trip")} locale={lang} dict={dict} />
      <Infrastructure image={home("infrastructure")} dict={dict} />
      <Seasons locale={lang} dict={dict} />
      <Faq locale={lang} dict={dict} items={faqs} />
      <PlanCta dict={dict} />
    </>
  );
}
