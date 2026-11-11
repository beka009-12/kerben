import type { FaqItem } from "@/utils/home/faq";
import "./faq-list.css";

export function FaqList({ items, numbered = false }: { items: FaqItem[]; numbered?: boolean }) {
  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <details key={item.q} className="faq-list-item">
          <summary className="faq-list-question">
            {numbered && (
              <span className="faq-list-number" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <span className="faq-list-text">{item.q}</span>
            <span className="faq-list-toggle" aria-hidden="true" />
          </summary>
          <p className={numbered ? "faq-list-answer faq-list-answer-numbered" : "faq-list-answer"}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
