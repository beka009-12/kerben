import type { ReactNode } from "react";
import "./status-screen.css";

export function StatusScreen({ code, title, text, children }: { code: string; title: string; text: string; children: ReactNode }) {
  return (
    <section className="status-screen">
      <p className="status-screen-code" aria-hidden="true">
        {code}
      </p>
      <h1 className="status-screen-title">{title}</h1>
      <p className="status-screen-text">{text}</p>
      <div className="status-screen-actions">{children}</div>
    </section>
  );
}
