import Image from "next/image";
import type { AboutSectionItem } from "@/utils/api/catalog";
import "./about-sections.css";

export function AboutSections({ kicker, sections }: { kicker: string; sections: AboutSectionItem[] }) {
  if (sections.length === 0) return null;
  return (
    <div className="about-sections">
      {sections.map((section) => {
        const photos = section.image ? [section.image] : [];
        return (
          <article key={section.id} className="about-sections-row">
            <div className="about-sections-copy">
              <p className="about-sections-kicker">{kicker}</p>
              {section.title && <h2 className="about-sections-title">{section.title}</h2>}
              {section.text && <p className="about-sections-text">{section.text}</p>}
            </div>
            {photos.length > 0 && (
              <div className="about-sections-photos">
                {photos.map((src) => (
                  <div key={src} className={photos.length === 1 ? "about-sections-media about-sections-media-wide" : "about-sections-media"}>
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes={photos.length === 1 ? "(min-width: 1280px) 1240px, 100vw" : "(min-width: 900px) 33vw, 100vw"}
                      className="about-sections-image"
                    />
                  </div>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
