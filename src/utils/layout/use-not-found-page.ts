"use client";

import { useI18n } from "@/utils/i18n/I18nProvider";
import { useSolidHeader } from "@/utils/store/header";

export function useNotFoundPage() {
  const { locale, dict } = useI18n();
  useSolidHeader();
  return { locale, dict };
}
