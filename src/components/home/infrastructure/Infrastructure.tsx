"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { useStickyProgress } from "@/utils/ui/use-scroll-progress";
import "./infrastructure.css";

export function Infrastructure({ image, dict }: { image: string; dict: Dictionary }) {
  const t = dict.home.infrastructure;
  const ref = useStickyProgress<HTMLElement>();
  const lines = t.title.split("\n");

  return (
    <section ref={ref} id="infrastructure" className="infrastructure" aria-labelledby="infrastructure-title">
      <div className="infrastructure-stage">
        <div className="infrastructure-media">
          <Image src={image} alt="" fill sizes="100vw" className="infrastructure-image" />
        </div>
        <div className="infrastructure-shade" />
        <div className="container infrastructure-inner">
          <p className="infrastructure-kicker">{t.kicker}</p>
          <h2 id="infrastructure-title" className="infrastructure-title">
            {lines.map((line, i) => (
              <span key={line} className="infrastructure-line" style={{ "--i": i, "--n": lines.length } as CSSProperties}>
                {line}{" "}
              </span>
            ))}
          </h2>
          <p className="infrastructure-text">{t.text}</p>
        </div>
      </div>
    </section>
  );
}
