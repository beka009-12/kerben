import type { Metadata, Viewport } from "next";
import { Inter, Literata, Manrope, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/layout/auto-refresh/AutoRefresh";
import { RequestToast } from "@/components/requests/request-toast/RequestToast";
import { ChromeGate } from "@/components/layout/chrome-gate/ChromeGate";
import { Footer } from "@/components/layout/footer/Footer";
import { Header } from "@/components/layout/header/Header";
import { MobileNav } from "@/components/layout/mobile-nav/MobileNav";
import { Providers } from "@/components/providers/Providers";
import { siteConfig } from "@/config/site";
import { getContacts } from "@/utils/api/contacts";
import { getTours } from "@/utils/api/tours";
import { hasLocale, localeNames, locales } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { toSearchItem } from "@/utils/search";
import { alternates } from "@/utils/seo";
import "../globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin", "cyrillic"],
  weight: "600",
  style: "italic",
  variable: "--font-literata",
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "800"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: dict.meta.title, template: `%s — ${siteConfig.name}` },
    description: dict.meta.description,
    applicationName: siteConfig.name,
    alternates: alternates(lang, ""),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: localeNames[lang].intl.replace("-", "_"),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#145ff0",
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, tours, contacts] = await Promise.all([getDictionary(lang), getTours(lang), getContacts(lang)]);
  const searchItems = tours.map(toSearchItem);

  return (
    <html
      lang={localeNames[lang].htmlLang}
      className={`${montserrat.variable} ${inter.variable} ${literata.variable} ${manrope.variable}`}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">
          {dict.a11y.skip}
        </a>
        <Providers locale={lang} dict={dict}>
          <AutoRefresh />
          <RequestToast />
          <ChromeGate>
            <Header searchItems={searchItems} contacts={contacts} />
          </ChromeGate>
          <main id="main" className="page-main">
            {children}
          </main>
          <ChromeGate>
            <Footer locale={lang} dict={dict} contacts={contacts} />
            <MobileNav />
          </ChromeGate>
        </Providers>
      </body>
    </html>
  );
}
