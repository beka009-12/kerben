"use client";

import { useEffect } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useSolidHeader } from "@/utils/store/header";

export function useErrorPage(error: Error & { digest?: string }) {
  const { locale, dict } = useI18n();
  useSolidHeader();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return { dict, homeHref: `/${locale}` };
}
