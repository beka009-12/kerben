"use client";

import { usePathname } from "next/navigation";
import { isFullscreenPage } from "@/utils/routes";
import { useHeaderStore } from "@/utils/store/header";

export function useChromeGate() {
  const pathname = usePathname();
  const adminScreen = useHeaderStore((state) => state.adminShell > 0);
  return { hidden: isFullscreenPage(pathname) || adminScreen };
}
