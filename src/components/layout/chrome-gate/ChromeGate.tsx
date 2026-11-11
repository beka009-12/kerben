"use client";

import type { ReactNode } from "react";
import { useChromeGate } from "@/utils/layout/use-chrome-gate";

export function ChromeGate({ children }: { children: ReactNode }) {
  const { hidden } = useChromeGate();
  if (hidden) return null;
  return children;
}
