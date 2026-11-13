import Image from "next/image";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./infrastructure.css";

export function Infrastructure({ image, dict }: { image: string; dict: Dictionary }) {
  const t = dict.home.infrastructure;
  return (
    <section className="infrastructure" aria-labelledby="infrastructure-title">
      <div className="container infrastructure-inner">
        <div className="infrastructure-copy">
          <p className="infrastructure-kicker">{t.kicker}</p>
          <h2 id="infrastructure-title" className="infrastructure-title">
            {t.title.replace(/\s*\n\s*/g, " ")}
          </h2>
          <p className="infrastructure-text">{t.text}</p>
        </div>
        <div className="infrastructure-media">
          <Image src={image} alt="" fill sizes="(min-width: 1024px) 568px, 100vw" className="infrastructure-image" />
        </div>
      </div>
    </section>
  );
}
