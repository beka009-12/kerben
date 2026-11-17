const PRODUCTION_URL = "https://www.kerben-travel.com";

export const siteConfig = {
  name: "Kerben Travel",
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_URL).replace(/\/+$/, ""),
  year: 2026,
  manager: {
    whatsapp: process.env.NEXT_PUBLIC_MANAGER_WHATSAPP ?? "",
    telegram: process.env.NEXT_PUBLIC_MANAGER_TELEGRAM ?? "",
  },
} as const;
