"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import { useProviders } from "@/utils/providers/use-providers";

export function Providers({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: ReactNode }) {
  useProviders();

  return (
    <I18nProvider locale={locale} dict={dict}>
      {children}
    </I18nProvider>
  );
}
