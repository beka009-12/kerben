import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./central-asia.css";

interface Flag {
  src: string;
  /** Uzbekistan's crescent and stars sit top-left, so a centred crop would cut them */
  position: string;
}

const FLAGS: readonly Flag[] = [
  { src: "/images/flags/kyrgyzstan.webp", position: "50% 50%" },
  { src: "/images/flags/uzbekistan.webp", position: "0% 0%" },
  { src: "/images/flags/kazakhstan.webp", position: "50% 50%" },
];

export function CentralAsia({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.centralAsia;

  return (
    <section id="central-asia" className="central-asia" aria-labelledby="central-asia-title">
      <div className="central-asia-flags" aria-hidden="true">
        {FLAGS.map((flag, i) => (
          <Image
            key={flag.src}
            src={flag.src}
            alt=""
            fill
            sizes="100vw"
            quality={90}
            className="central-asia-flag"
            style={{ "--i": i, objectPosition: flag.position } as CSSProperties}
          />
        ))}
      </div>
      <div className="central-asia-shade" aria-hidden="true" />
      <div className="container central-asia-inner">
        <p className="central-asia-subtitle">{t.subtitle}</p>
        <h2 id="central-asia-title" className="central-asia-title">
          {t.title}
        </h2>
        <Link href={`/${locale}/chat?ask=${encodeURIComponent(t.ask)}`} className="central-asia-cta">
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
