import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { photoCredits } from "@/data/credits";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import "./credits-page.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/credits">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.creditsTitle, alternates: alternates(lang, "/credits") };
}

export default async function CreditsPage({ params }: PageProps<"/[lang]/credits">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.credits;

  return (
    <section className="section credits-page">
      <div className="container credits-page-inner">
        <h1 className="credits-page-title">{t.title}</h1>
        <p className="credits-page-text">{t.text}</p>
        <ul className="credits-page-list">
          {photoCredits.map((credit) => (
            <li key={credit.file} className="credits-page-item">
              <Image src={credit.file} alt="" width={96} height={64} className="credits-page-thumb" />
              <dl className="credits-page-meta">
                <dt className="credits-page-term">{t.author}</dt>
                <dd className="credits-page-value">{credit.author}</dd>
                <dt className="credits-page-term">{t.license}</dt>
                <dd className="credits-page-value">{credit.license}</dd>
                <dt className="credits-page-term">{t.source}</dt>
                <dd className="credits-page-value">
                  <a href={credit.source} target="_blank" rel="noopener noreferrer" className="credits-page-link">
                    Wikimedia Commons
                  </a>
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
