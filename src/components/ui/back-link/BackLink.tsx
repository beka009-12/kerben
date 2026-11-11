"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { useBackLink } from "@/utils/trip/use-back-link";

export function BackLink({ href, label, className }: { href: string; label: string; className: string }) {
  const link = useBackLink(href, label);

  return (
    <Link href={link.href} className={className}>
      <Icon name="arrowLeft" size={16} />
      {link.text}
    </Link>
  );
}
