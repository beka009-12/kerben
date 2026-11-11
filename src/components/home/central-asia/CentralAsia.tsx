"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { COUNTRY_FLAGS, FLAG_FOCUS, useCentralAsia } from "@/utils/home/use-central-asia";
import { useReveal } from "@/utils/ui/use-reveal";
import "./central-asia.css";

const step = (i: number) => ({ "--d": i }) as CSSProperties;

export function CentralAsia({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.centralAsia;
  const { active, select, onKeyDown } = useCentralAsia(t.countries.length);
  const { ref, visible } = useReveal();
  const item = (base: string) => (visible ? `${base} central-asia-in` : base);

  return (
    <section id="central-asia" className="central-asia" aria-labelledby="central-asia-title">
      <div className="central-asia-flags" aria-hidden="true">
        {t.countries.map((country, i) => (
          <Image
            key={country.name}
            src={COUNTRY_FLAGS[i] ?? COUNTRY_FLAGS[0]}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            loading="eager"
            style={{ "--fx": FLAG_FOCUS[i]?.[0] ?? 0.5, "--fy": FLAG_FOCUS[i]?.[1] ?? 0.5 } as CSSProperties}
            className={i === active ? "central-asia-flag central-asia-flag-active" : "central-asia-flag"}
          />
        ))}
      </div>
      <div className="central-asia-shade" aria-hidden="true" />

      <div ref={ref} className="container central-asia-inner">
        <p className={item("central-asia-kicker")} style={step(0)}>
          {t.kicker}
        </p>
        <h2 id="central-asia-title" className={item("central-asia-title")} style={step(1)}>
          {t.title.split("\n").map((line) => (
            <span key={line} className="central-asia-title-line">
              {line}{" "}
            </span>
          ))}
        </h2>

        <div className={item("central-asia-switch")} style={step(2)} role="tablist" aria-label={t.kicker}>
          {t.countries.map((country, i) => (
            <button
              key={country.name}
              type="button"
              role="tab"
              id={`central-asia-tab-${i}`}
              aria-selected={i === active}
              aria-controls="central-asia-places"
              tabIndex={i === active ? 0 : -1}
              className={i === active ? "central-asia-option central-asia-option-active" : "central-asia-option"}
              onClick={() => select(i)}
              onKeyDown={onKeyDown}
            >
              {country.name}
            </button>
          ))}
        </div>

        <div id="central-asia-places" role="tabpanel" aria-labelledby={`central-asia-tab-${active}`} className={item("central-asia-places")} style={step(3)}>
          {t.countries.map((country, i) => (
            <p key={country.name} className={i === active ? "central-asia-line central-asia-line-active" : "central-asia-line"} aria-hidden={i !== active}>
              {country.places.join(" · ")}
            </p>
          ))}
        </div>

        <div className={item("central-asia-footer")} style={step(4)}>
          <Link href={`/${locale}/chat?ask=${encodeURIComponent(t.ask)}`} className="central-asia-cta">
            {t.cta}
            <Icon name="arrowRight" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
