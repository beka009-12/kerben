import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero/PageHero";
import { ContactForm } from "@/components/contact/contact-form/ContactForm";
import { ContactInfo } from "@/components/contact/contact-info/ContactInfo";
import { kg } from "@/data/images";
import { getContacts } from "@/utils/api/contacts";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { alternates } from "@/utils/seo";
import "./contact-page.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.contactTitle, description: dict.meta.contactDescription, alternates: alternates(lang, "/contact") };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, contacts] = await Promise.all([getDictionary(lang), getContacts(lang)]);
  const t = dict.contact;

  return (
    <>
      <PageHero kicker={t.kicker} title={t.title} text={t.text} image={kg("ala-archa")} />
      <section className="section section-soft">
        <div className="container contact-page-grid">
          <ContactInfo dict={dict} contacts={contacts} />
          <ContactForm contacts={{ whatsappHref: contacts.whatsappHref, telegramHref: contacts.telegramHref }} />
        </div>
      </section>
    </>
  );
}
