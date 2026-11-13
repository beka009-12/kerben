import Image from "next/image";
import type { ReactNode } from "react";
import "./page-hero.css";

export function PageHero({
  kicker,
  title,
  text,
  image,
  children,
}: {
  kicker?: string;
  title: string;
  text?: string;
  image: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="container-wide">
        <div className="page-hero-card">
          <Image src={image} alt="" fill preload quality={85} sizes="(min-width: 1440px) 1360px, 100vw" className="page-hero-image" />
          <div className="page-hero-shade" />
          <div className="page-hero-inner">
            {children}
            {kicker && <p className="page-hero-kicker">{kicker}</p>}
            <h1 className="page-hero-title">{title}</h1>
            {text && <p className="page-hero-text">{text}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
