"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { pagePhoto } from "@/data/images";
import type { CompanyStats } from "@/utils/api/about";
import { formatNumber } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { useCountUp } from "@/utils/ui/use-count-up";
import { useReveal } from "@/utils/ui/use-reveal";
import { useScrollProgress } from "@/utils/ui/use-scroll-progress";
import "./stats-band.css";

function StatValue({ value, run, locale }: { value: string; run: boolean; locale: Locale }) {
  return <>{useCountUp(value, run, locale)}</>;
}

export function StatsBand({ dict, locale, stats }: { dict: Dictionary; locale: Locale; stats: CompanyStats | null }) {
  const t = dict.home.stats;
  const sectionRef = useScrollProgress<HTMLElement>();
  const { ref, visible } = useReveal();
  const items = t.items.map((item, i) => {
    const value = stats?.[i];
    if (value === undefined || value === null) return item;
    const plus = item.value.trim().endsWith("+") ? "+" : "";
    return { ...item, value: `${formatNumber(value, locale)}${plus}` };
  });

  return (
    <section ref={sectionRef} className="stats-band" aria-labelledby="stats-title">
      <Image src={pagePhoto("lake-peaks-hd")} alt="" fill sizes="100vw" className="stats-band-photo" />
      <div className="stats-band-shade" aria-hidden="true" />
      <div ref={ref} className="container stats-band-inner">
        <h2 id="stats-title" className={visible ? "stats-band-title stats-band-title-visible" : "stats-band-title"}>
          {t.title}
        </h2>
        <dl className="stats-band-list">
          {items.map((item, i) => (
            <div
              key={item.label}
              className={visible ? "stats-band-item stats-band-item-visible" : "stats-band-item"}
              style={{ "--i": i } as CSSProperties}
            >
              <dt className="stats-band-value">
                <StatValue value={item.value} run={visible} locale={locale} />
              </dt>
              <dd className="stats-band-label">{item.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
