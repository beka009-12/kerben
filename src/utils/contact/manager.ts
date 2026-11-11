import { siteConfig } from "@/config/site";

/** Проверенные контакты менеджера: null — контакта нет или это заглушка, кнопку не показываем */
export interface ManagerContacts {
  /** Номер для wa.me: только цифры, с кодом страны, без «+» */
  whatsapp: string | null;
  /** Username для t.me без «@» или номер телефона вида +996700000000 */
  telegram: string | null;
}

/** Номер в формате wa.me; заглушки вида 996000000000 и слишком короткие/длинные номера отбрасываем */
export function whatsappNumber(value: string | null | undefined): string | null {
  const raw = value?.trim() ?? "";
  if (!raw) return null;
  const fromLink = raw.match(/wa\.me\/(\d+)/i)?.[1];
  const digits = (fromLink ?? raw).replace(/\D/g, "").replace(/^00/, "");
  if (digits.length < 10 || digits.length > 15) return null;
  if (/^\d{1,3}0{7,}$/.test(digits)) return null;
  return digits;
}

/** Username Telegram из «name», «@name» или «https://t.me/name»; ссылки пересылки (t.me/share) не принимаем */
export function telegramUsername(value: string | null | undefined): string | null {
  const raw = value?.trim() ?? "";
  if (!raw) return null;
  const fromLink = raw.match(/^(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([^/?#]+)\/?$/i)?.[1];
  if (/^(?:https?:\/\/)/i.test(raw) && !fromLink) return null;
  const phone = whatsappNumber(fromLink ?? raw);
  if (phone && /^\+?[\d\s()-]+$/.test(fromLink ?? raw)) return `+${phone}`;
  const name = (fromLink ?? raw).replace(/^@/, "");
  if (["share", "joinchat", "addstickers", "proxy", "s"].includes(name.toLowerCase())) return null;
  return /^[a-z][a-z0-9_]{4,31}$/i.test(name) ? name : null;
}

export function managerContacts(source: { whatsapp?: string; telegram?: string } = siteConfig.manager): ManagerContacts {
  return { whatsapp: whatsappNumber(source.whatsapp), telegram: telegramUsername(source.telegram) };
}

export const whatsappUrl = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export const telegramUrl = (username: string) => `https://t.me/${username}`;

/** Текст сообщения менеджеру: шаблон из словаря с {title} и {url} */
export const managerMessage = (template: string, title: string, url: string) => template.replace("{title}", title).replace("{url}", url);
