"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon/Icon";

const VIDEO_SRC = "/videos/hero-kerben-hd.mp4";
/** Первый кадр ролика — виден до загрузки, при «меньше движения» и в режиме экономии трафика */
const POSTER = "/images/hero/hero-poster.webp";

interface NetworkInfo {
  saveData?: boolean;
}

interface HeroVideoProps {
  pauseLabel: string;
  playLabel: string;
}

export function HeroVideo({ pauseLabel, playLabel }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  async function start() {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
    } catch {
      // Браузер запретил автозапуск: событие play не придёт, остаётся постер и кнопка «Воспроизвести»
    }
  }

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: NetworkInfo }).connection?.saveData === true;
    if (!still && !saveData) void start();
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void start();
    else video.pause();
  }

  return (
    <>
      <video
        ref={videoRef}
        className="hero-video"
        src={VIDEO_SRC}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {/* WCAG 2.2.2: движение дольше 5 секунд — с видимой паузой */}
      <button
        type="button"
        className="hero-video-toggle"
        aria-label={playing ? pauseLabel : playLabel}
        onClick={toggle}
      >
        <Icon name={playing ? "pause" : "play"} size={18} />
      </button>
    </>
  );
}
