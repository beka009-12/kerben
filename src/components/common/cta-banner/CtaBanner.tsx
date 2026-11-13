import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import "./cta-banner.css";

export function CtaBanner({
  eyebrow,
  title,
  text,
  actions,
  trust = [],
  image,
}: {
  eyebrow?: string;
  title: string;
  text: string;
  actions: ReactNode;
  trust?: string[];
  image: string;
}) {
  return (
    <section className="cta-banner" aria-labelledby="cta-title">
      <Image src={image} alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" className="cta-banner-image" />
      <div className="cta-banner-shade" />
      <div className="cta-banner-body">
        <div className="cta-banner-copy">
          {eyebrow && (
            <p className="cta-banner-eyebrow">
              <span className="cta-banner-dot" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <h2 id="cta-title" className="cta-banner-title">
            {title}
          </h2>
          <p className="cta-banner-text">{text}</p>
        </div>
        <div className="cta-banner-actions">{actions}</div>
        {trust.length > 0 && (
          <ul className="cta-banner-trust">
            {trust.map((item) => (
              <li key={item} className="cta-banner-trust-item">
                <span className="cta-banner-check" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function CtaBannerLink({ href, variant, children }: { href: string; variant: "primary" | "glass"; children: ReactNode }) {
  return (
    <Link href={href} className={`cta-banner-button cta-banner-button-${variant}`}>
      {children}
    </Link>
  );
}
