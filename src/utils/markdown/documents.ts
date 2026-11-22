import { photoCredits } from "@/data/credits";
import { ATTRACTIONS } from "@/data/attractions";
import type { Tour } from "@/types/tour";
import type { AboutSectionItem, HelicopterItem, HotelItem, TransportItem, TrekkingItem } from "@/utils/api/catalog";
import type { SiteContacts } from "@/utils/api/contacts";
import { siteConfig } from "@/config/site";
import { formatPrice, plural } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { inclusionLabel } from "@/utils/inclusions";
import { seatsLabel } from "@/utils/listing-items";
import { fill, offerPrice } from "@/utils/offers";
import { tourLocation, type Theme } from "@/utils/tour-filters";
import { bullets, documentHead, esc, join, link, MD_LABELS, markdownUrl, paragraphs, section } from "./md";

const fact = (label: string, value: string | null | undefined) => (value ? `- **${esc(label)}:** ${esc(value)}` : "");
const facts = (...lines: string[]) => lines.filter(Boolean).join("\n");
const text = (value: string) => paragraphs(value).join("\n\n");

export function tourDays(tour: Pick<Tour, "days">, locale: Locale, dict: Dictionary): string | null {
  if (tour.days <= 0) return null;
  return tour.days === 1 ? dict.card.oneDay : `${tour.days} ${plural(tour.days, locale, dict.tour.dayForms)}`;
}

/** Цена «от $X за человека» — как в карточке бронирования */
const perPrice = (amount: number, per: string, locale: Locale, dict: Dictionary) =>
  amount > 0 ? `${dict.card.from} ${formatPrice(amount, locale)} ${per}`.trim() : null;

/** Как связаться: те же каналы, что в карточке бронирования и на странице контактов */
export function bookingSection(locale: Locale, dict: Dictionary, contacts: SiteContacts, path: string): string {
  const l = MD_LABELS[locale];
  const t = dict.contact;
  const channels = [
    contacts.phone && contacts.phoneHref ? `- ${esc(t.phone)}: [${esc(contacts.phone)}](${contacts.phoneHref})` : "",
    contacts.whatsappHref ? `- ${esc(t.whatsapp)}: ${contacts.whatsappHref}` : "",
    contacts.telegramHref ? `- ${esc(t.telegram)}: ${contacts.telegramHref}` : "",
    contacts.email ? `- ${esc(t.email)}: [${esc(contacts.email)}](mailto:${contacts.email})` : "",
    `- ${esc(t.hours)}: ${esc(t.hoursText)}`,
  ].filter(Boolean);
  return section(l.howToBook, `${esc(l.bookText)}\n\n${channels.join("\n")}\n\n${link(dict.nav.contact, markdownUrl(locale, "/contact"))} · ${link(l.webPage, `${siteConfig.url}/${locale}${path}`)}`);
}

interface Ctx {
  locale: Locale;
  dict: Dictionary;
  contacts: SiteContacts;
}

export function tourDocument({ locale, dict, contacts }: Ctx, tour: Tour): string {
  const t = dict.tour;
  const path = `/tours/${tour.slug}`;
  const nights = tour.nights ?? null;
  const rating = tour.reviews > 0 && tour.rating > 0 ? `${tour.rating} / 5 (${tour.reviews} ${plural(tour.reviews, locale, dict.card.reviewForms)})` : null;
  const itinerary = tour.itinerary
    .filter((stage) => stage.title || stage.text)
    .map((stage) => [`### ${esc(t.day)} ${esc(stage.day)}${stage.title ? `: ${esc(stage.title)}` : ""}`, stage.text ? text(stage.text) : ""].filter(Boolean).join("\n\n"))
    .join("\n\n");
  return join(
    documentHead({ locale, path, title: tour.title, summary: tour.summary, source: dict.nav.tours }),
    section(
      MD_LABELS[locale].details,
      facts(
        fact(t.duration, tourDays(tour, locale, dict)),
        nights !== null ? fact(t.nights, nights > 0 ? `${nights} ${plural(nights, locale, t.nightForms)}` : t.noNights) : "",
        fact(t.category, tourLocation(tour)),
        fact(t.groupSize, tour.groupSize),
        fact(MD_LABELS[locale].price, perPrice(tour.price, t.perPerson, locale, dict)),
        fact(t.rating, rating),
      ),
    ),
    section(t.about, text(tour.overview)),
    section(t.itinerary, itinerary),
    tour.included.length > 0 && section(t.included, bullets(tour.included.map((key) => esc(inclusionLabel(key, t.inclusions))))),
    tour.excluded.length > 0 && section(t.notIncluded, bullets(tour.excluded.map((key) => esc(inclusionLabel(key, t.inclusions))))),
    bookingSection(locale, dict, contacts, path),
    `_${esc(MD_LABELS[locale].priceUsd)} ${esc(MD_LABELS[locale].notListed)}_`,
  );
}

export function toursDocument({ locale, dict, contacts }: Ctx, tours: Tour[], title: string, summary: string): string {
  const t = dict.tour;
  const list = tours
    .map((tour) => {
      const bits = [tourDays(tour, locale, dict), tourLocation(tour), perPrice(tour.price, t.perPerson, locale, dict)].filter(Boolean).join(" · ");
      return `- ${link(tour.title, markdownUrl(locale, `/tours/${tour.slug}`))}${bits ? ` — ${esc(bits)}` : ""}${tour.summary ? `. ${esc(tour.summary)}` : ""}`;
    })
    .join("\n");
  return join(
    documentHead({ locale, path: "/tours", title, summary, source: dict.nav.tours }),
    section(dict.nav.tours, list),
    section(dict.tours.cta.title, `${esc(dict.tours.cta.text)} ${esc(dict.home.custom.text)}`),
    bookingSection(locale, dict, contacts, "/tours"),
    `_${esc(MD_LABELS[locale].priceUsd)}_`,
  );
}

interface Offer {
  path: string;
  title: string;
  price: string | null;
  meta: string[];
  summary: string;
}

/** Список предложений раздела (отели, трекинг, транспорт, вертолёты) — это же и тематическая карта раздела */
function offersDocument(ctx: Ctx, section_: { path: string; title: string; summary: string; heading: string }, offers: Offer[]): string {
  const { locale, dict, contacts } = ctx;
  const list = offers
    .map((offer) => {
      const bits = [...offer.meta, offer.price].filter(Boolean).join(" · ");
      return `- ${link(offer.title, markdownUrl(locale, offer.path))}${bits ? ` — ${esc(bits)}` : ""}${offer.summary ? `. ${esc(offer.summary)}` : ""}`;
    })
    .join("\n");
  return join(
    documentHead({ locale, path: section_.path, title: section_.title, summary: section_.summary, source: section_.heading }),
    section(section_.heading, list || esc(dict.offers.emptyText)),
    bookingSection(locale, dict, contacts, section_.path),
    `_${esc(MD_LABELS[locale].priceUsd)}_`,
  );
}

const short = (value: string, max = 180) => {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
};

export const hotelsDocument = (ctx: Ctx, hotels: HotelItem[], title: string) =>
  offersDocument(ctx, { path: "/hotels", title, summary: ctx.dict.hotels.text, heading: ctx.dict.nav.hotels }, hotels.map((hotel) => ({
    path: `/hotels/${hotel.id}`,
    title: hotel.name,
    price: perPrice(hotel.price, ctx.dict.units[hotel.unit] ?? ctx.dict.hotels.perNight, ctx.locale, ctx.dict),
    meta: [hotel.location].filter(Boolean),
    summary: short(hotel.description),
  })));

export const trekkingDocument = (ctx: Ctx, treks: TrekkingItem[], title: string) =>
  offersDocument(ctx, { path: "/trekking", title, summary: ctx.dict.trekking.text, heading: ctx.dict.nav.trekking }, treks.map((trek) => ({
    path: `/trekking/${trek.id}`,
    title: trek.title,
    price: offerPrice(trek.price, trek.unit, ctx.locale, ctx.dict) || null,
    meta: trek.days ? [fill(ctx.dict.trekking.days, trek.days)] : [],
    summary: short(trek.description),
  })));

export const transportDocument = (ctx: Ctx, cars: TransportItem[], title: string) =>
  offersDocument(ctx, { path: "/transport", title, summary: ctx.dict.transport.text, heading: ctx.dict.nav.transport }, cars.map((car) => ({
    path: `/transport/${car.id}`,
    title: car.name,
    price: offerPrice(car.price, car.unit, ctx.locale, ctx.dict) || null,
    meta: [car.seats > 0 ? seatsLabel(car.seats, ctx.locale, ctx.dict) : "", car.hasDriver ? ctx.dict.transport.driver : ctx.dict.transport.noDriver].filter(Boolean),
    summary: short(car.description),
  })));

export const helicopterDocument = (ctx: Ctx, flights: HelicopterItem[], title: string) =>
  offersDocument(ctx, { path: "/helicopter", title, summary: ctx.dict.helicopter.text, heading: ctx.dict.nav.helicopter }, flights.map((flight) => ({
    path: `/helicopter/${flight.id}`,
    title: flight.title,
    price: offerPrice(flight.price, flight.unit, ctx.locale, ctx.dict) || null,
    meta: [flight.minutes ? fill(ctx.dict.helicopter.minutes, flight.minutes) : "", flight.route].filter(Boolean),
    summary: short(flight.description),
  })));

export function hotelDocument(ctx: Ctx, hotel: HotelItem): string {
  const { locale, dict, contacts } = ctx;
  const t = dict.hotels;
  const names = t.amenities as Record<string, string>;
  const path = `/hotels/${hotel.id}`;
  const place = [hotel.address, hotel.location].filter(Boolean).join(" · ");
  return join(
    documentHead({ locale, path, title: hotel.name, summary: hotel.description || hotel.location, source: dict.nav.hotels }),
    section(MD_LABELS[locale].details, facts(fact(t.location, place), fact(MD_LABELS[locale].price, perPrice(hotel.price, dict.units[hotel.unit] ?? t.perNight, locale, dict)))),
    section(t.about, text(hotel.description || t.aboutFallback)),
    hotel.amenities.length > 0 && section(t.amenitiesTitle, bullets(hotel.amenities.map((key) => esc(names[key] ?? key)))),
    bookingSection(locale, dict, contacts, path),
    `_${esc(MD_LABELS[locale].priceUsd)} ${esc(MD_LABELS[locale].notListed)}_`,
  );
}

export function trekDocument(ctx: Ctx, trek: TrekkingItem): string {
  const { locale, dict, contacts } = ctx;
  const path = `/trekking/${trek.id}`;
  const program = trek.program
    .filter((step) => step.title || step.text)
    .map((step) => [`### ${esc(dict.tour.day)} ${esc(step.day)}${step.title ? `: ${esc(step.title)}` : ""}`, step.text ? text(step.text) : ""].filter(Boolean).join("\n\n"))
    .join("\n\n");
  return join(
    documentHead({ locale, path, title: trek.title, summary: trek.description, source: dict.nav.trekking }),
    section(MD_LABELS[locale].details, facts(fact(dict.tour.duration, trek.days ? fill(dict.trekking.days, trek.days) : null), fact(MD_LABELS[locale].price, offerPrice(trek.price, trek.unit, locale, dict) || null))),
    section(dict.offers.about, text(trek.description)),
    section(dict.offers.program, program),
    bookingSection(locale, dict, contacts, path),
    `_${esc(MD_LABELS[locale].priceUsd)} ${esc(MD_LABELS[locale].notListed)}_`,
  );
}

export function carDocument(ctx: Ctx, car: TransportItem): string {
  const { locale, dict, contacts } = ctx;
  const t = dict.transport;
  const path = `/transport/${car.id}`;
  return join(
    documentHead({ locale, path, title: car.name, summary: car.description || car.subtitle || t.text, source: dict.nav.transport }),
    section(
      t.specs,
      facts(
        fact(t.seatsLabel, car.seats > 0 ? String(car.seats) : null),
        fact(t.driverLabel, car.hasDriver ? t.yes : t.no),
        fact(t.acLabel, car.hasAirConditioner ? t.yes : t.no),
        fact(t.modelLabel, car.model),
        fact(t.yearLabel, car.year ? String(car.year) : null),
        fact(t.colorLabel, car.color),
        fact(MD_LABELS[locale].price, perPrice(car.price, dict.units[car.unit] ?? "", locale, dict)),
      ),
    ),
    section(t.about, text(car.description || t.aboutFallback)),
    bookingSection(locale, dict, contacts, path),
    `_${esc(MD_LABELS[locale].priceUsd)} ${esc(MD_LABELS[locale].notListed)}_`,
  );
}

export function flightDocument(ctx: Ctx, flight: HelicopterItem): string {
  const { locale, dict, contacts } = ctx;
  const t = dict.helicopter;
  const path = `/helicopter/${flight.id}`;
  return join(
    documentHead({ locale, path, title: flight.title, summary: flight.description || flight.route || t.text, source: t.title }),
    section(
      MD_LABELS[locale].details,
      facts(
        fact(t.duration, flight.minutes ? fill(t.minutes, flight.minutes) : null),
        fact(t.routeLabel, flight.route),
        fact(t.passengersLabel, flight.passengers ? fill(t.upTo, flight.passengers) : null),
        fact(t.priceLabel, perPrice(flight.price, dict.units[flight.unit] ?? "", locale, dict)),
      ),
    ),
    section(t.about, text(flight.description || t.aboutFallback)),
    section(t.stepsTitle, t.steps.map((step, i) => `${i + 1}. **${esc(step.title)}.** ${esc(step.text)}`).join("\n")),
    section(t.weatherTitle, esc(t.weatherText)),
    bookingSection(locale, dict, contacts, path),
    `_${esc(MD_LABELS[locale].priceUsd)} ${esc(MD_LABELS[locale].notListed)}_`,
  );
}

export function experienceDocument(ctx: Ctx, theme: Theme, item: { title: string; text: string }, tours: Tour[], seoTitle: string): string {
  const { locale, dict, contacts } = ctx;
  const t = dict.home.experiences;
  const path = `/experiences/${theme}`;
  const list = tours.map((tour) => {
    const bits = [tourDays(tour, locale, dict), perPrice(tour.price, dict.tour.perPerson, locale, dict)].filter(Boolean).join(" · ");
    return `- ${link(tour.title, markdownUrl(locale, `/tours/${tour.slug}`))}${bits ? ` — ${esc(bits)}` : ""}`;
  });
  return join(
    documentHead({ locale, path, title: seoTitle, summary: item.text, source: t.kicker }),
    section(t.tours, list.length > 0 ? list.join("\n") : esc(t.empty)),
    bookingSection(locale, dict, contacts, path),
  );
}

export function attractionsDocument({ locale, dict }: Omit<Ctx, "contacts">, title: string): string {
  const t = dict.attractions;
  const items = t.items as Record<string, { name: string; region: string; facts: string[]; text: string[] }>;
  const places = ATTRACTIONS.map((place) => items[place.slug]).filter(Boolean);
  return join(
    documentHead({ locale, path: "/attractions", title, summary: t.text, source: dict.nav.attractions }),
    ...places.map((place) => section(place.name, [`*${esc(place.region)}* · ${place.facts.map(esc).join(" · ")}`, ...place.text.map(esc)].join("\n\n"))),
    section(t.ctaTitle, `${esc(t.ctaText)} ${link(dict.nav.tours, markdownUrl(locale, "/tours"))}`),
  );
}

export function faqDocument({ locale, dict, contacts }: Ctx, questions: { q: string; a: string }[], title: string): string {
  const t = dict.home.faq;
  return join(
    documentHead({ locale, path: "/faq", title, summary: t.page.text, source: dict.nav.faq }),
    ...questions.map((item) => section(item.q, text(item.a))),
    section(t.page.helpTitle, esc(t.page.helpText)),
    bookingSection(locale, dict, contacts, "/faq"),
  );
}

export function aboutDocument({ locale, dict, contacts }: Ctx, sections: AboutSectionItem[], title: string): string {
  const t = dict.about;
  return join(
    documentHead({ locale, path: "/about", title, summary: `${t.introTitle} ${t.introText}`, source: dict.nav.about }),
    section(t.title, [esc(t.introText), esc(t.note)].join("\n\n")),
    section(dict.home.stats.kicker, bullets(dict.home.stats.items.map((item) => `**${esc(item.value)}** ${esc(item.label)}`))),
    section(t.valuesTitle, bullets(t.values.map((value) => `**${esc(value.title)}.** ${esc(value.text)}`))),
    sections.length > 0 && section(t.storyTitle, [esc(t.story), ...sections.map((item) => `### ${esc(item.title)}\n\n${text(item.text)}`)].join("\n\n")),
    section(dict.nav.contact, [link(dict.nav.contact, markdownUrl(locale, "/contact")), contacts.email ? esc(contacts.email) : ""].filter(Boolean).join(" · ")),
  );
}

export function contactDocument({ locale, dict, contacts }: Ctx, title: string, socials: string[]): string {
  const t = dict.contact;
  const lines = [
    contacts.phone && contacts.phoneHref ? `- **${esc(t.phone)}:** [${esc(contacts.phone)}](${contacts.phoneHref})` : "",
    contacts.whatsappHref ? `- **${esc(t.whatsapp)}:** ${contacts.whatsappHref}` : "",
    contacts.telegramHref ? `- **${esc(t.telegram)}:** ${contacts.telegramHref}` : "",
    contacts.email ? `- **${esc(t.email)}:** [${esc(contacts.email)}](mailto:${contacts.email})` : "",
    `- **${esc(t.office)}:** ${esc(contacts.address || t.officeText)}`,
    `- **${esc(t.hours)}:** ${esc(t.hoursText)}`,
    `- **2GIS:** ${siteConfig.twoGis.url} (${siteConfig.twoGis.rating} / 5)`,
  ].filter(Boolean);
  return join(
    documentHead({ locale, path: "/contact", title, summary: t.cardText, source: t.title }),
    section(t.cardTitle, lines.join("\n")),
    socials.length > 0 && section(dict.footer.company, bullets(socials)),
    section(t.formTitle, esc(t.formText)),
  );
}

export function creditsDocument({ locale, dict }: Omit<Ctx, "contacts">, title: string): string {
  const t = dict.credits;
  return join(
    documentHead({ locale, path: "/credits", title, summary: t.text, source: t.title }),
    section(
      t.title,
      bullets(photoCredits.map((credit) => `${esc(credit.file.split("/").pop() ?? credit.file)} — ${esc(t.author)}: ${esc(credit.author)}; ${esc(t.license)}: ${esc(credit.license)}; ${esc(t.source)}: ${credit.source}`)),
    ),
  );
}

interface HomeInput {
  title: string;
  description: string;
  popular: Tour[];
  faqs: { q: string; a: string }[];
}

export function homeDocument({ locale, dict, contacts }: Ctx, { title, description, popular, faqs }: HomeInput, themes: readonly Theme[]): string {
  const h = dict.home;
  const sections = [
    [dict.nav.tours, "/tours"],
    [dict.nav.trekking, "/trekking"],
    [dict.nav.hotels, "/hotels"],
    [dict.nav.transport, "/transport"],
    [dict.nav.helicopter, "/helicopter"],
    [dict.nav.attractions, "/attractions"],
    [dict.nav.faq, "/faq"],
    [dict.nav.about, "/about"],
    [dict.nav.contact, "/contact"],
  ] as const;
  return join(
    documentHead({ locale, path: "", title, summary: description, source: siteConfig.name }),
    section(dict.hero.title, `${esc(dict.hero.text)}\n\n${bullets(dict.hero.features.map(esc))}`),
    section(h.stats.kicker, bullets(h.stats.items.map((item) => `**${esc(item.value)}** ${esc(item.label)}`))),
    section(MD_LABELS[locale].topics, bullets(sections.map(([label, path]) => link(label, markdownUrl(locale, path))))),
    popular.length > 0 &&
      section(
        dict.popular.title,
        bullets(popular.map((tour) => `${link(tour.title, markdownUrl(locale, `/tours/${tour.slug}`))}${perPrice(tour.price, dict.tour.perPerson, locale, dict) ? ` — ${esc(perPrice(tour.price, dict.tour.perPerson, locale, dict) ?? "")}` : ""}`)),
      ),
    section(h.experiences.title, bullets(themes.map((theme, i) => (h.experiences.items[i] ? `${link(h.experiences.items[i].title, markdownUrl(locale, `/experiences/${theme}`))}: ${esc(h.experiences.items[i].text)}` : "")).filter(Boolean))),
    section(h.centralAsia.title, `${esc(h.centralAsia.text)}\n\n${bullets(h.centralAsia.countries.map((country) => `**${esc(country.name)}:** ${country.places.map(esc).join(", ")}`))}\n\n${esc(h.centralAsia.note)}`),
    section(h.custom.title, `${esc(h.custom.lead)} ${esc(h.custom.text)}\n\n${bullets(h.custom.audiences.map(esc))}`),
    section(h.infrastructure.kicker, esc(h.infrastructure.text)),
    section(h.seasons.title, bullets(h.seasons.items.map((item) => `**${esc(item.title)} (${esc(item.months)}):** ${esc(item.text)}`))),
    faqs.length > 0 && section(h.faq.title, faqs.map((item) => `### ${esc(item.q)}\n\n${text(item.a)}`).join("\n\n")),
    bookingSection(locale, dict, contacts, ""),
  );
}
