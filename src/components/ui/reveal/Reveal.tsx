"use client";

import { type ReactNode } from "react";
import { useReveal } from "@/utils/ui/use-reveal";
import "./reveal.css";

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, visible } = useReveal();

  return (
    <div ref={ref} className={[visible ? "reveal reveal-visible" : "reveal", className ?? ""].join(" ")}>
      {children}
    </div>
  );
}
