export const siteConfig = {
  name: "Kerben Travel",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  year: 2026,
  manager: {
    whatsapp: process.env.NEXT_PUBLIC_MANAGER_WHATSAPP ?? "",
    telegram: process.env.NEXT_PUBLIC_MANAGER_TELEGRAM ?? "",
  },
} as const;
