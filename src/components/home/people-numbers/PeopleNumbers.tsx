"use client";

import Image from "next/image";
import type { CompanyStats } from "@/utils/api/about";
import { formatNumber } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { useStickyProgress } from "@/utils/ui/use-scroll-progress";
import "./people-numbers.css";

function Lines({ text, className }: { text: string; className: string }) {
  return text.split("\n").map((line) => (
    <span key={line} className={className}>
      <Accent text={line} />{" "}
    </span>
  ));
}

function Accent({ text }: { text: string }) {
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <em key={i} className="people-numbers-accent">
        {part.slice(1, -1)}
      </em>
    ) : (
      part
    ),
  );
}

export function PeopleNumbers({ dict, locale, stats }: { dict: Dictionary; locale: Locale; stats: CompanyStats | null }) {
  const ref = useStickyProgress<HTMLElement>();
  const story = dict.story;
  const t = dict.home.stats;
  const items = t.items.map((item, i) => {
    const value = stats?.[i];
    if (value === undefined || value === null) return item;
    const plus = item.value.trim().endsWith("+") ? "+" : "";
    return { ...item, value: `${formatNumber(value, locale)}${plus}` };
  });

  return (
    <section ref={ref} className="people-numbers" aria-labelledby="people-title">
      <div className="people-numbers-stage">
        <div className="people-numbers-top">
          <div className="people-numbers-intro">
            <h2 id="people-title" className="people-numbers-title">
              <Lines text={story.outroLead} className="people-numbers-line" />
            </h2>
            <p className="people-numbers-text">
              <Lines text={story.outroText} className="people-numbers-text-line" />
            </p>
          </div>
          <Image
            src="/images/numbers/hospitality-v2.webp"
            alt=""
            width={1200}
            height={796}
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="people-numbers-art"
          />
        </div>

        <div className="people-numbers-view">
          <Image src="/images/numbers/lake-v3.webp" alt="" width={1774} height={887} sizes="100vw" quality={90} className="people-numbers-photo" />
          <div className="people-numbers-blend" aria-hidden="true" />
          <div className="people-numbers-bottom">
            <div className="people-numbers-wrap">
              <h2 className="people-numbers-heading">
                <Lines text={t.title} className="people-numbers-line" />
              </h2>
              <dl className="people-numbers-cards">
                {items.map((item) => (
                  <div key={item.label} className="people-numbers-card">
                    <dt className="people-numbers-value">{item.value}</dt>
                    <dd className="people-numbers-label">{item.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
