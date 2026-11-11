import Image from "next/image";
import type { ReactNode } from "react";
import { GateLink } from "@/components/ui/gate-link/GateLink";
import { Icon } from "@/components/ui/icon/Icon";
import type { OfferFact } from "@/utils/offers";
import "./offer-card.css";

export function OfferCard({
  image,
  title,
  subtitle,
  facts = [],
  text,
  price,
  href,
  actions,
}: {
  image: string;
  title: string;
  subtitle?: string;
  facts?: OfferFact[];
  text?: string;
  price?: ReactNode;
  href?: string;
  actions?: ReactNode;
}) {
  return (
    <article className="offer-card">
      <div className="offer-card-media">
        <Image src={image} alt="" fill sizes="(min-width: 1100px) 380px, (min-width: 640px) 50vw, 100vw" className="offer-card-image" />
      </div>
      <div className="offer-card-body">
        {subtitle && <p className="offer-card-subtitle">{subtitle}</p>}
        <h3 className="offer-card-title">
          {href ? (
            <GateLink href={href} title={title} image={image} className="offer-card-link">
              {title}
            </GateLink>
          ) : (
            title
          )}
        </h3>
        {facts.length > 0 && (
          <ul className="offer-card-facts">
            {facts.map((fact) => (
              <li key={fact.label} className="offer-card-fact">
                <Icon name={fact.icon} size={14} />
                {fact.label}
              </li>
            ))}
          </ul>
        )}
        {text && <p className="offer-card-text">{text}</p>}
        <div className="offer-card-footer">
          {price && <p className="offer-card-price">{price}</p>}
          {actions && <div className="offer-card-actions">{actions}</div>}
        </div>
      </div>
    </article>
  );
}
