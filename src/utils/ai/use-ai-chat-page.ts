"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { safeNext } from "@/utils/routes";
import { useAuth } from "@/utils/store/auth";

export function useAiChatPage() {
  const { locale, dict } = useI18n();
  const { status, user } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (status === "user" && next) router.replace(`/${locale}${next}`);
  }, [status, next, locale, router]);

  return { locale, dict, status, user, next };
}
