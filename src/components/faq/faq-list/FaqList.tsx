"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/utils/home/faq";
import "./faq-list.css";

export function FaqList({ items, numbered = false, openFirst = false }: { items: FaqItem[]; numbered?: boolean; openFirst?: boolean }) {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(openFirst ? 0 : null);

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={isOpen ? "faq-list-item faq-list-item-open" : "faq-list-item"}>
            <h3 className="faq-list-heading">
              <button
                type="button"
                id={`${uid}-q${i}`}
                className="faq-list-question"
                aria-expanded={isOpen}
                aria-controls={`${uid}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {numbered && (
                  <span className="faq-list-number" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="faq-list-text">{item.q}</span>
                <span className="faq-list-toggle" aria-hidden="true" />
              </button>
            </h3>
            <div id={`${uid}-a${i}`} className="faq-list-panel" inert={!isOpen}>
              <div className="faq-list-panel-inner">
                <p className={numbered ? "faq-list-answer faq-list-answer-numbered" : "faq-list-answer"}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
