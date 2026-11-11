import Image from "next/image";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./plan-cta.css";

export function PlanCta({ image, dict }: { image: string; dict: Dictionary }) {
  const t = dict.home.plan;
  return (
    <section className="plan-cta" aria-labelledby="plan-title">
      <Image src={image} alt="" fill sizes="100vw" className="plan-cta-image" />
      <div className="plan-cta-shade" />
      <div className="container plan-cta-inner">
        <h2 id="plan-title" className="plan-cta-title">
          {t.title}
        </h2>
        <p className="plan-cta-text">{t.text}</p>
        <ul className="plan-cta-facts">
          {t.facts.map((fact) => (
            <li key={fact} className="plan-cta-fact">
              {fact}
            </li>
          ))}
        </ul>
        <p className="plan-cta-tagline">{t.tagline}</p>
      </div>
    </section>
  );
}
