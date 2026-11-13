import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./plan-cta.css";

const FACT = /^(\d[\d\s.,]*\+?)\s+(.+)$/;

export function PlanCta({ dict }: { dict: Dictionary }) {
  const t = dict.home.plan;
  return (
    <section className="plan-cta" aria-labelledby="plan-title">
      <div className="container">
        <div className="plan-cta-card">
          <div className="plan-cta-copy">
            <h2 id="plan-title" className="plan-cta-title">
              {t.title}
            </h2>
            <p className="plan-cta-text">{t.text}</p>
          </div>
          <ul className="plan-cta-facts">
            {t.facts.map((fact) => {
              const match = FACT.exec(fact);
              return (
                <li key={fact} className="plan-cta-fact">
                  {match ? (
                    <>
                      <strong className="plan-cta-value">{match[1]}</strong> {match[2]}
                    </>
                  ) : (
                    fact
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
