"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon/Icon";
import { useAiTripCard } from "@/utils/ai/use-ai-trip-card";
import { formatPrice } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import { KIND_ICONS } from "@/utils/trip/trip-icons";
import type { PickKind, TripPick } from "@/utils/trip/trip-store";
import "./ai-trip-card.css";

export function AiTripCard({
  picked,
  kinds,
  locale,
  labels,
  onRemove,
}: {
  picked: TripPick[];
  kinds: Record<PickKind, string>;
  locale: Locale;
  labels: { title: string; hint: string; remove: string; show: string; hide: string; count: string };
  onRemove: (kind: PickKind) => void;
}) {
  const { open, listId, toggle } = useAiTripCard();

  return (
    <section className="ai-trip" aria-label={labels.title}>
      <div className="ai-trip-bar">
        <button type="button" className="ai-trip-toggle" onClick={toggle} aria-expanded={open} aria-controls={listId} title={open ? labels.hide : labels.show}>
          <span className="ai-trip-icon" aria-hidden="true">
            <Icon name="ticket" size={18} />
          </span>
          <span className="ai-trip-heading">
            <span className="ai-trip-title">
              {labels.title}
              <span className="ai-trip-count">{labels.count.replace("{count}", String(picked.length))}</span>
            </span>
            <span className="ai-trip-names">{picked.map((pick) => pick.title).join(" · ")}</span>
          </span>
          <span className="ai-trip-thumbs" aria-hidden="true">
            {picked.slice(0, 3).map((pick) => (
              <span key={pick.key} className="ai-trip-thumb">
                {pick.image ? <Image src={pick.image} alt="" fill sizes="36px" className="ai-trip-image" /> : <Icon name={KIND_ICONS[pick.kind]} size={14} />}
              </span>
            ))}
          </span>
          <Icon name="chevronDown" size={18} className={open ? "ai-trip-chevron ai-trip-chevron-open" : "ai-trip-chevron"} />
        </button>
      </div>

      {open && (
        <div id={listId} className="ai-trip-panel">
          <p className="ai-trip-hint">{labels.hint}</p>
          <ul className="ai-trip-list">
            {picked.map((pick) => (
              <li key={pick.key} className="ai-trip-item">
                <span className="ai-trip-photo">
                  {pick.image ? <Image src={pick.image} alt="" fill sizes="96px" className="ai-trip-image" /> : <Icon name={KIND_ICONS[pick.kind]} size={20} />}
                </span>
                <span className="ai-trip-info">
                  <span className="ai-trip-kind">{kinds[pick.kind]}</span>
                  <span className="ai-trip-name">{pick.title}</span>
                  {pick.price > 0 && (
                    <span className="ai-trip-price">
                      {formatPrice(pick.price, locale)}
                      {pick.unit ? ` ${pick.unit}` : ""}
                    </span>
                  )}
                </span>
                <button type="button" className="ai-trip-remove" onClick={() => onRemove(pick.kind)} aria-label={`${labels.remove}: ${pick.title}`}>
                  <Icon name="close" size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
