import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/utils/i18n/config";
import { backendFetch } from "./backend";
import { RETRY_SOON, errorText } from "./cache-fallback";

interface BackendContact {
  id: number;
  country: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  telegram: string | null;
  address: string | null;
  is_active: boolean;
}

export interface SiteContacts {
  phone: string | null;
  phoneHref: string | null;
  email: string | null;
  whatsappHref: string | null;
  instagramHref: string | null;
  telegramHref: string | null;
  facebookHref: string | null;
  address: string;
}

const digits = (value: string) => value.replace(/[^\d+]/g, "");

function whatsappLink(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

function socialLink(value: string | null | undefined, base: string): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `${base}${v.replace(/^@/, "")}`;
}

function telegramLink(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (v && /^\+?[\d\s()-]{10,}$/.test(v)) return `https://t.me/+${v.replace(/\D/g, "")}`;
  return socialLink(value, "https://t.me/");
}

export const NO_CONTACTS: SiteContacts = {
  phone: null,
  phoneHref: null,
  email: null,
  whatsappHref: null,
  instagramHref: null,
  telegramHref: null,
  facebookHref: null,
  address: "",
};

export async function getContacts(locale: Locale): Promise<SiteContacts> {
  try {
    return await loadContacts(locale);
  } catch (error) {
    console.warn("[contacts] backend unavailable:", error instanceof Error ? error.message : error);
    return NO_CONTACTS;
  }
}

export async function loadContacts(locale: Locale): Promise<SiteContacts> {
  "use cache";
  cacheLife("minutes");
  cacheTag("contacts");

  let list: BackendContact[];
  try {
    list = await backendFetch<BackendContact[]>(`/contacts/?lang=${locale}`);
  } catch (error) {
    // Ошибка внутри "use cache" валит сборку — короткий кеш и без выдуманных контактов
    console.warn("[contacts] backend unavailable:", errorText(error));
    cacheLife(RETRY_SOON);
    return NO_CONTACTS;
  }
  const c = (Array.isArray(list) ? list : []).find((item) => item.is_active !== false);
  if (!c) return NO_CONTACTS;
  const phone = c.phone?.trim();
  return {
    phone: phone || null,
    phoneHref: phone ? `tel:${digits(phone)}` : null,
    email: c.email?.trim() || null,
    whatsappHref: c.whatsapp?.trim() ? whatsappLink(c.whatsapp.trim()) : null,
    instagramHref: socialLink(c.instagram, "https://instagram.com/"),
    telegramHref: telegramLink(c.telegram),
    facebookHref: socialLink(c.facebook, "https://facebook.com/"),
    address: [c.city, c.address].map((part) => part?.trim()).filter(Boolean).join(", "),
  };
}
