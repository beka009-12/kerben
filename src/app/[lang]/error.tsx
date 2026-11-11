"use client";

import { StatusScreen } from "@/components/common/status-screen/StatusScreen";
import { Button, ButtonLink } from "@/components/ui/button/Button";
import { useErrorPage } from "@/utils/layout/use-error-page";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { dict, homeHref } = useErrorPage(error);

  return (
    <StatusScreen code="500" title={dict.error.title} text={dict.error.text}>
      <Button onClick={() => retry()}>{dict.error.retry}</Button>
      <ButtonLink href={homeHref} variant="outline">
        {dict.notFound.home}
      </ButtonLink>
    </StatusScreen>
  );
}
