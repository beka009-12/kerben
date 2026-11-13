import type { ReactNode } from "react";
import "./detail-section.css";

export function DetailSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="detail-section" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="detail-section-title">
        {title}
      </h2>
      {children}
    </section>
  );
}
