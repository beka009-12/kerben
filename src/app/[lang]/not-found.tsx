"use client";

import { StatusScreen } from "@/components/common/status-screen/StatusScreen";
import { ButtonLink } from "@/components/ui/button/Button";
import { useNotFoundPage } from "@/utils/layout/use-not-found-page";

export default function NotFound() {
  const { dict, homeHref, toursHref } = useNotFoundPage();
  return (
    <StatusScreen code="404" title={dict.notFound.title} text={dict.notFound.text}>
      <ButtonLink href={homeHref}>{dict.notFound.home}</ButtonLink>
      <ButtonLink href={toursHref} variant="outline">
        {dict.cta.browse}
      </ButtonLink>
    </StatusScreen>
  );
}
