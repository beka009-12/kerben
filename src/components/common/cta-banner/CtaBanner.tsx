import Image from "next/image";
import type { ReactNode } from "react";
import "./cta-banner.css";

export function CtaBanner({
  title,
  text,
  action,
  image,
}: {
  title: string;
  text: string;
  action: ReactNode;
  image: string;
}) {
  return (
    <section className="cta-banner" aria-labelledby="cta-title">
      <Image src={image} alt="" fill sizes="(min-width: 1240px) 1240px, 100vw" className="cta-banner-image" />
      <div className="cta-banner-shade" />
      <div className="cta-banner-body">
        <h2 id="cta-title" className="cta-banner-title">
          {title}
        </h2>
        <p className="cta-banner-text">{text}</p>
      </div>
      {action}
    </section>
  );
}
