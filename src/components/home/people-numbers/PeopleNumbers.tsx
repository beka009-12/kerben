import Image from "next/image";
import type { CompanyStats } from "@/utils/api/about";
import { formatNumber } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./people-numbers.css";

const plain = (text: string) => text.replace(/\*/g, "").replace(/\s*\n\s*/g, " ").trim();

export function PeopleNumbers({ dict, locale, stats }: { dict: Dictionary; locale: Locale; stats: CompanyStats | null }) {
  const t = dict.home.stats;
  const items = t.items.map((item, i) => {
    const value = stats?.[i];
    if (value === undefined || value === null) return item;
    const plus = item.value.trim().endsWith("+") ? "+" : "";
    return { ...item, value: `${formatNumber(value, locale)}${plus}` };
  });

  return (
    <section className="people-numbers" aria-labelledby="people-title">
      <div className="container people-numbers-inner">
        <div className="people-numbers-copy">
          <p className="people-numbers-kicker">{t.kicker}</p>
          <h2 id="people-title" className="people-numbers-title">
            {plain(dict.story.outroLead)}
          </h2>
          <p className="people-numbers-text">{plain(dict.story.outroText)}</p>
          <dl className="people-numbers-cards">
            {items.map((item) => (
              <div key={item.label} className="people-numbers-card">
                <dt className="people-numbers-value">{item.value}</dt>
                <dd className="people-numbers-label">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="people-numbers-photos" aria-hidden="true">
          <div className="people-numbers-photo">
            <Image
              src="/images/home/numbers-guests.webp"
              alt=""
              fill
              sizes="780px"
              className="people-numbers-image people-numbers-image-start"
            />
          </div>
          <div className="people-numbers-photo people-numbers-photo-low">
            <Image
              src="/images/home/numbers-guests.webp"
              alt=""
              fill
              sizes="780px"
              className="people-numbers-image people-numbers-image-end"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
