const PRODUCTION_URL = "https://www.kerben-travel.com";

export const siteConfig = {
  name: "Kerben Travel",
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_URL).replace(/\/+$/, ""),
  year: 2026,
  /** Как бренд пишут в поиске: имя аккаунтов в Instagram/Telegram/2GIS, слитно, кириллицей и по-китайски (凯尔本 — Kerben в китайской Википедии) */
  alternateNames: ["Kerben Travels", "KerbenTravel", "Кербен Тревел", "凯尔本旅行"],
  /** Канал из Taplink в шапке Instagram. В backend есть только чат по номеру, отдельного поля под канал нет */
  telegramChannel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL?.trim() || "https://t.me/kerben_travels",
  /** Карточка в 2ГИС для sameAs и ссылки на отзывы. Рейтинг обновлять вручную: 20.11.2026 — 4.9 из 159 оценок */
  twoGis: {
    url: "https://2gis.kg/bishkek/firm/70000001086785636",
    rating: 4.9,
  },
  /** Часы офиса, как в карточке 2ГИС. Текст на сайте — contact.hoursText в словарях, тест следит, чтобы совпадал */
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "11:00",
    closes: "20:00",
  },
  manager: {
    whatsapp: process.env.NEXT_PUBLIC_MANAGER_WHATSAPP ?? "",
    telegram: process.env.NEXT_PUBLIC_MANAGER_TELEGRAM ?? "",
  },
} as const;
