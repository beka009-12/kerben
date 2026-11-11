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
import { StoryPanels } from "@/components/home/story-panels/StoryPanels";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { siteConfig } from "@/config/site";
import { EXPERIENCES } from "@/data/experiences";
import { kg, pagePhoto, photos } from "@/data/images";
import { getFaqs } from "@/utils/api/catalog";
import { getContacts } from "@/utils/api/contacts";
import { getTours } from "@/utils/api/tours";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { inKyrgyzstan } from "@/utils/markers";

const HERO = ["/images/hero/issyk-kul-hd.webp", "/images/hero/song-kul-hd.webp", "/images/hero/jeti-oguz-hd.webp", "/images/hero/ala-archa-hd.webp"];

const STORY = [kg("song-kul-peaks"), kg("issyk-kul-beach"), kg("nomads"), photos.oldStreet, kg("yurts-horse")];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, tours, faqs, contacts] = await Promise.all([getDictionary(lang), getTours(lang), getFaqs(lang), getContacts(lang)]);

  const popular = [...tours.filter((tour) => inKyrgyzstan(tour.coords)), ...tours.filter((tour) => !inKyrgyzstan(tour.coords))].slice(0, 8);

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
      <Hero images={HERO} />
      <StoryPanels images={STORY} />
      <PeopleNumbers dict={dict} locale={lang} stats={null} />
      <Reveal>
        <ExperienceGrid
          images={EXPERIENCES.map((item) => item.image)}
          themes={EXPERIENCES.map((item) => item.theme)}
          locale={lang}
          dict={dict}
        />
      </Reveal>
      {popular.length > 0 && (
        <Reveal>
          <PopularDestinations tours={popular} locale={lang} dict={dict} />
        </Reveal>
      )}
      <CentralAsia locale={lang} dict={dict} />
      <Reveal>
        <CustomTrip image={photos.hikers} locale={lang} dict={dict} />
      </Reveal>
      <Infrastructure image={kg("song-kul-yurts")} dict={dict} />
      <Reveal>
        <Seasons locale={lang} dict={dict} />
      </Reveal>
      <Faq locale={lang} dict={dict} items={faqs} />
      <PlanCta image={pagePhoto("glacier-lake")} dict={dict} />
    </>
  );
}
