import { TourContact } from "@/components/tour/tour-contact/TourContact";
import { DifficultyGauge } from "./DifficultyGauge";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { managerContacts, telegramUsername, whatsappNumber } from "@/utils/contact/manager";
import { getContacts } from "@/utils/api/contacts";
import { convertUsd, getKgsRates } from "@/utils/api/rates";
import { formatMoney, formatNumber, formatPrice, plural } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import type { Tour } from "@/types/tour";
import "./tour-summary.css";

function guestsLabel(groupSize: string, t: Dictionary["tour"]): string | null {
  const max = groupSize.match(/[–-]\s*(\d+)/)?.[1];
  if (max) return t.guestsUpTo.replace("{n}", max);
  return /^\d+$/.test(groupSize.trim()) ? t.guests.replace("{n}", groupSize.trim()) : null;
}

export async function TourSummary({ tour, locale, dict }: { tour: Tour; locale: Locale; dict: Dictionary }) {
  const t = dict.tour;
  const manager = managerContacts();
  const [site, rates] = await Promise.all([getContacts(locale), getKgsRates()]);
  const converted = rates && tour.price > 0 ? convertUsd(tour.price, rates) : null;
  const otherPrices = converted ? [`${formatNumber(converted.kgs, locale)} ${t.som}`, formatMoney(converted.rub, locale, "RUB")] : [];
  const nights = tour.nights ?? null;
  const contacts = {
    whatsapp: manager.whatsapp ?? whatsappNumber(site.whatsappHref),
    telegram: manager.telegram ?? telegramUsername(site.telegramHref),
  };
  const guests = tour.groupSize ? guestsLabel(tour.groupSize, t) : null;
  const keyFacts = [
    ...(tour.days > 0 ? [{ key: "days", label: t.duration, value: `${tour.days} ${plural(tour.days, locale, t.dayForms)}`, icon: "clock" as IconName }] : []),
    ...(nights !== null && tour.days > 0
      ? [{ key: "nights", label: t.nights, value: nights > 0 ? `${nights} ${plural(nights, locale, t.nightForms)}` : t.noNights, icon: "bed" as IconName }]
      : []),
    ...(tour.difficulty ? [{ key: "difficulty", label: t.difficulty, value: t.difficultyLevels[tour.difficulty], icon: null }] : []),
    ...(guests ? [{ key: "group", label: t.groupSize, value: guests, icon: "users" as IconName }] : []),
  ];

  const extra = [
    ...(tour.languages.length > 0 ? [{ icon: "language" as IconName, text: tour.languages.join(", ") }] : []),
    ...(tour.reviews > 0 ? [{ icon: "star" as IconName, text: `${tour.rating.toFixed(1)} · ${tour.reviews}` }] : []),
  ];

  const question = dict.ai.askTour.replace("{title}", tour.title);

  return (
    <section id="overview" className="tour-summary" aria-labelledby="overview-title">
      <div className="container tour-summary-inner">
        <div className="tour-summary-main">
          <h2 id="overview-title" className="tour-summary-title">
            {t.about}
          </h2>
          {tour.overview && <p className="tour-summary-text">{tour.overview}</p>}
          {keyFacts.length > 0 && (
            <dl className="tour-summary-facts">
              {keyFacts.map((fact) => (
                <div key={fact.key} className="tour-summary-fact">
                  <span className="tour-summary-fact-visual">
                    {fact.icon ? (
                      <Icon name={fact.icon} size={30} className="tour-summary-fact-icon" />
                    ) : (
                      tour.difficulty && <DifficultyGauge level={tour.difficulty} />
                    )}
                  </span>
                  <dt className="tour-summary-fact-label">{fact.label}</dt>
                  <dd className="tour-summary-fact-value">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {extra.length > 0 && (
            <ul className="tour-summary-extra">
              {extra.map((item) => (
                <li key={item.icon}>
                  <Icon name={item.icon} size={16} />
                  {item.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="tour-summary-aside" aria-label={t.contact}>
          <TourContact
            title={tour.title}
            price={formatPrice(tour.price, locale)}
            otherPrices={otherPrices}
            ratesNote={rates ? `${t.inOther} ${rates.date}` : undefined}
            contacts={contacts}
            askHref={`/${locale}/chat?ask=${encodeURIComponent(question)}`}
            labels={{
              from: t.from,
              perPerson: t.perPerson,
              message: t.contactMessage,
              whatsapp: dict.contact.whatsapp,
              telegram: dict.contact.telegram,
              ask: dict.ai.tourButton,
            }}
          />
        </aside>
      </div>
    </section>
  );
}
