import Image from "next/image";
import type { CompanyStats } from "@/utils/api/about";
import { formatNumber } from "@/utils/format";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./people-numbers.css";

interface PeopleNumbersProps {
  dict: Dictionary;
  locale: Locale;
  stats: CompanyStats | null;
}

const plain = (text: string) => text.replace(/\*/g, "").replace(/\s*\n\s*/g, " ").trim();

export interface StatItem {
  value: string;
  label: string;
}

/** Тёмные карточки с цифрами — общие для главной и страницы «О нас» */
export function NumbersCards({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <dl className={className ? `numbers-view-cards ${className}` : "numbers-view-cards"}>
      {items.map((item) => (
        <div key={item.label} className="numbers-view-card">
          <dt className="numbers-view-value">{item.value}</dt>
          <dd className="numbers-view-label">{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PeopleNumbers({ dict, locale, stats }: PeopleNumbersProps) {
  const t = dict.home.stats;
  const items = t.items.map((item, i) => {
    const value = stats?.[i];
    if (value === undefined || value === null) return item;
    const plus = item.value.trim().endsWith("+") ? "+" : "";
    return { ...item, value: `${formatNumber(value, locale)}${plus}` };
  });

  return (
    <>
      <section className="numbers-view" aria-labelledby="numbers-title">
        <div className="container numbers-view-wrap">
          <h2 id="numbers-title" className="numbers-view-heading">
            {plain(t.title)}
          </h2>
          <NumbersCards items={items} />
        </div>
      </section>

      <section className="people-numbers" aria-labelledby="people-title">
        <div className="container people-numbers-inner">
          <div className="people-numbers-copy">
            <h2 id="people-title" className="people-numbers-title">
              {plain(dict.story.outroLead)}
            </h2>
            <p className="people-numbers-text">{plain(dict.story.outroText)}</p>
          </div>
          <div className="people-numbers-photos" aria-hidden="true">
            <div className="people-numbers-photo">
              <Image src="/images/home/numbers-milk-pour.webp" alt="" fill sizes="240px" className="people-numbers-image" />
            </div>
            <div className="people-numbers-photo people-numbers-photo-low">
              <Image src="/images/home/numbers-milk-bowl.webp" alt="" fill sizes="240px" className="people-numbers-image" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
