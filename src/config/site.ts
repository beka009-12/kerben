const PRODUCTION_URL = "https://www.kerben-travel.com";

export const siteConfig = {
  name: "Kerben Travel",
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_URL).replace(/\/+$/, ""),
  year: 2026,
  /** Канал из Taplink в шапке Instagram. В backend есть только чат по номеру, отдельного поля под канал нет */
  telegramChannel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL?.trim() || "https://t.me/kerben_travels",
  manager: {
    whatsapp: process.env.NEXT_PUBLIC_MANAGER_WHATSAPP ?? "",
    telegram: process.env.NEXT_PUBLIC_MANAGER_TELEGRAM ?? "",
  },
} as const;
