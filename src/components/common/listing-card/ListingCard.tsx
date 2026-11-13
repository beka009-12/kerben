import Image from "next/image";
import type { ReactNode } from "react";
import { GateLink } from "@/components/ui/gate-link/GateLink";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import "./listing-card.css";

export interface ListingCardPrice {
  from?: string;
  amount: string;
  per?: string;
}

export interface ListingCardProps {
  href?: string;
  title: string;
  image: string;
  tag?: string;
  meta?: { icon: IconName; text: string };
  price?: ListingCardPrice;
  eager?: boolean;
  sizes?: string;
  footer?: ReactNode;
  action?: ReactNode;
}

export function ListingCard({
  href,
  title,
  image,
  tag,
  meta,
  price,
  eager = false,
  sizes = "(min-width: 1280px) 368px, (min-width: 700px) 45vw, 92vw",
  footer,
  action,
}: ListingCardProps) {
  return (
    <article className="listing-card">
      <div className="listing-card-media">
        <Image src={image} alt="" fill quality={85} loading={eager ? "eager" : "lazy"} sizes={sizes} className="listing-card-image" />
        {tag && <span className="listing-card-tag">{tag}</span>}
        {action && <span className="listing-card-action">{action}</span>}
      </div>

      <div className="listing-card-body">
        {meta && (
          <p className="listing-card-meta">
            <Icon name={meta.icon} size={16} />
            <span className="listing-card-meta-text">{meta.text}</span>
          </p>
        )}
        <h3 className="listing-card-title">
          {href ? (
            <GateLink href={href} title={title} image={image} className="listing-card-link">
              {title}
            </GateLink>
          ) : (
            title
          )}
        </h3>
        <span className="listing-card-spacer" />
        {(price || href) && (
          <div className="listing-card-footer">
            {price ? (
              <p className="listing-card-price">
                {price.from && <span className="listing-card-unit">{price.from}</span>}
                <strong className="listing-card-amount">{price.amount}</strong>
                {price.per && <span className="listing-card-unit">/ {price.per}</span>}
              </p>
            ) : (
              <span />
            )}
            {href && (
              <span className="listing-card-arrow" aria-hidden="true">
                <Icon name="arrowRight" size={16} />
              </span>
            )}
          </div>
        )}
        {footer}
      </div>
    </article>
  );
}
