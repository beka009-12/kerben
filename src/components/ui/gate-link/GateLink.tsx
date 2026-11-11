"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { rememberScroll } from "@/utils/ui/scroll-memory";

export function GateLink({
  href,
  className,
  tabIndex,
  hidden,
  children,
}: {
  href: string;
  title?: string;
  image?: string | null;
  className?: string;
  tabIndex?: number;
  hidden?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} tabIndex={tabIndex} aria-hidden={hidden || undefined} onClick={() => rememberScroll()}>
      {children}
    </Link>
  );
}
