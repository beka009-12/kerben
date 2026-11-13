import "server-only";
import type { BookingCardLabels, BookingField } from "@/components/common/booking-card/BookingCard";
import { getContacts } from "@/utils/api/contacts";
import { convertUsd, getKgsRates } from "@/utils/api/rates";
import { managerContacts, telegramUsername, whatsappNumber, type ManagerContacts } from "@/utils/contact/manager";
import { formatMoney, formatNumber, plural } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";

export interface BookingExtras {
  otherPrices: string[];
  ratesNote?: string;
  contacts: ManagerContacts;
}

/** Цена в сомах и рублях по курсу НБКР и проверенные контакты менеджера для карточки бронирования */
export async function getBookingExtras(locale: Locale, dict: Dictionary, priceUsd: number, convert = true): Promise<BookingExtras> {
  const manager = managerContacts();
  const [site, rates] = await Promise.all([getContacts(locale), convert ? getKgsRates() : Promise.resolve(null)]);
  const converted = rates && priceUsd > 0 ? convertUsd(priceUsd, rates) : null;
  return {
    otherPrices: converted ? [`${formatNumber(converted.kgs, locale)} ${dict.tour.som}`, formatMoney(converted.rub, locale, "RUB")] : [],
    ratesNote: rates ? `${dict.tour.inOther} ${rates.date}` : undefined,
    contacts: {
      whatsapp: manager.whatsapp ?? whatsappNumber(site.whatsappHref),
      telegram: manager.telegram ?? telegramUsername(site.telegramHref),
    },
  };
}

export function countField(key: string, label: string, forms: Record<string, string> & { other: string }, locale: Locale, initial = 2): BookingField {
  const options = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1} ${plural(i + 1, locale, forms)}` }));
  return { kind: "count", key, label, options, initial };
}

export const dateField = (key: string, label: string): BookingField => ({ kind: "date", key, label });

export function bookingLabels(dict: Dictionary, per: string, options: { book?: string; heading?: string; notes?: boolean } = {}): BookingCardLabels {
  return {
    from: dict.tour.from,
    per,
    heading: options.heading,
    datePlaceholder: dict.tour.datePh,
    notChosen: dict.offers.notChosen,
    book: options.book ?? dict.tour.bookNow,
    whatsapp: dict.contact.whatsapp,
    telegram: dict.contact.telegram,
    ask: dict.ai.tourButton,
    contactMessage: dict.tour.contactMessage,
    bookMessage: dict.tour.bookMessage,
    ...(options.notes ? { note: dict.hotels.noPay, reply: dict.hotels.reply } : {}),
  };
}
