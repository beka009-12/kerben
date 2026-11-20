"use client";

import { NotFoundScreen } from "@/components/common/not-found-screen/NotFoundScreen";
import { useNotFoundPage } from "@/utils/layout/use-not-found-page";

export default function NotFound() {
  const { locale, dict } = useNotFoundPage();
  return <NotFoundScreen locale={locale} dict={dict} />;
}
