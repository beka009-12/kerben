"use client";

import Link from "next/link";
import { CinemaBackdrop } from "@/components/ui/cinema-backdrop/CinemaBackdrop";
import { Icon } from "@/components/ui/icon/Icon";
import { SlideProgress } from "@/components/ui/slide-progress/SlideProgress";
import { HERO_VIDEOS, SLIDE_MS, useHero } from "@/utils/home/use-hero";
import "./hero.css";

const FEATURE_ICONS = ["mountain", "shield", "globe"] as const;

export function Hero({ images }: { images: string[] }) {
  const { t, slide, slides, labels, toursHref, chatHref, poster, photos, videoRef, clip, onClipEnd, onClipError, index, previous, paused, goTo } = useHero(images);

  return (
    <section className="hero" aria-labelledby="hero-title">
      {photos ? (
        <CinemaBackdrop images={slides} index={index} previous={previous} quality={90} fast />
      ) : (
        <div className="hero-videos" aria-hidden="true">
          {HERO_VIDEOS.map((src, i) => (
            <video
              key={src}
              ref={videoRef(i)}
              className={i === clip ? "hero-video hero-video-active" : "hero-video"}
              src={src}
              poster={i === 0 ? poster : undefined}
              autoPlay={i === 0}
              loop={HERO_VIDEOS.length === 1}
              muted
              playsInline
              preload={i === clip || i === (clip + 1) % HERO_VIDEOS.length ? "auto" : "none"}
              onEnded={onClipEnd}
              onError={() => onClipError(i)}
            />
          ))}
        </div>
      )}
      <div className="hero-shade" />

      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-kicker">{t.eyebrow}</p>
          <h1 id="hero-title" className="hero-title">
            {t.title} <span className="hero-title-accent">{t.titleAccent}</span>
          </h1>
          <p className="hero-text">{t.text}</p>
          <ul className="hero-features">
            {t.features.map((feature, i) => (
              <li key={feature} className="hero-feature">
                <Icon name={FEATURE_ICONS[i % FEATURE_ICONS.length]} size={30} className="hero-feature-icon" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            <Link href={toursHref} className="hero-cta">
              {t.primary}
              <Icon name="arrowRight" size={18} />
            </Link>
            <Link href={chatHref} className="hero-ghost">
              <Icon name="chat" size={18} />
              {t.secondary}
            </Link>
          </div>
        </div>

        {!photos && (
          <p className="hero-place">
            <Icon name="mapPin" size={20} className="hero-place-icon" />
            <span className="hero-place-name">{t.place}</span>
            <span className="hero-place-note">{t.placeNote}</span>
          </p>
        )}

        {photos && (
          <div className="hero-side">
            <p key={index} className="hero-caption" aria-live="polite">
              <span className="hero-caption-place">{slide.place}</span>
              <span className="hero-caption-text">{slide.caption}</span>
            </p>
            <SlideProgress labels={labels} index={index} duration={SLIDE_MS} paused={paused} onSelect={goTo} />
          </div>
        )}
      </div>
    </section>
  );
}
