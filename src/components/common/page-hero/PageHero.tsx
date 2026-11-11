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
  const words = title.trim().split(" ");
  const head = words.length > 1 ? words.slice(0, -1).join(" ") : "";
  const tail = words.length > 1 ? words[words.length - 1] : title;
  return (
    <section className="page-hero">
      <Image src={image} alt="" fill sizes="100vw" loading="eager" fetchPriority="high" className="page-hero-image" />
      <div className="page-hero-shade" />
      <div className="container page-hero-inner">
        {kicker && <p className="page-hero-kicker">{kicker}</p>}
        <h1 className="page-hero-title">
          {head ? (
            <>
              {head} <span className="page-hero-accent">{tail}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {text && <p className="page-hero-text">{text}</p>}
        {children}
      </div>
    </section>
  );
}
