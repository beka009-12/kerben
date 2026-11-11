"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { FRAME_MS, useStoryPanels } from "@/utils/home/use-story-panels";
import "./story-panels.css";

export function StoryPanels({ images }: { images: string[] }) {
  const { t, panels, active, previous, goTo, stageRef, href, onStageClick, onTouchStart, onTouchEnd, panel } = useStoryPanels();

  return (
    <section className="story" aria-labelledby="story-title">
      <h2 id="story-title" className="visually-hidden">
        {t.title}
      </h2>

      <div
        ref={stageRef}
        className="story-stage"
        style={{ "--story-ms": `${FRAME_MS}ms` } as CSSProperties}
        onClick={onStageClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {panels.map((item, i) => (
          <div
            key={item.title}
            className={i === active ? "story-frame story-frame-active" : i === previous ? "story-frame story-frame-previous" : "story-frame"}
            aria-hidden="true"
          >
            <Image src={images[i % images.length]} alt="" fill sizes="100vw" loading={i < 2 ? "eager" : "lazy"} className="story-frame-image" />
          </div>
        ))}
        <div className="story-shade" />

        <div className="container story-content">
          <div key={active} className="story-copy" aria-live="polite">
            <p className="story-stat">{panel.stat}</p>
            <p className="story-title">{panel.title}</p>
            <p className="story-text">{panel.text}</p>
            <Link href={href} className="story-link">
              {t.cta}
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          <ol className="story-nav">
            {panels.map((item, i) => (
              <li key={item.title} className="story-nav-entry">
                <button
                  type="button"
                  className={i === active ? "story-nav-item story-nav-item-active" : "story-nav-item"}
                  onClick={() => goTo(i)}
                  aria-current={i === active ? "step" : undefined}
                  aria-label={`${String(i + 1).padStart(2, "0")} ${item.title}`}
                >
                  <span className="story-nav-line">
                    <span key={i === active ? `on-${active}` : "off"} className="story-nav-fill" />
                  </span>
                  <span className="story-nav-number">{String(i + 1).padStart(2, "0")}</span>
                  <span className="story-nav-label">{item.title.replace(/\.$/, "")}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <span className="story-hint" aria-hidden="true">
          <Icon name="play" size={12} />
          {t.tapHint}
        </span>
      </div>
    </section>
  );
}
