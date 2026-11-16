"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon/Icon";

const VIDEO_SRC = "/videos/hero-kerben-hd.mp4";
/** На вертикальном экране 16:9 обрезается до узкой полосы — там играет отдельный вертикальный ролик */
const MOBILE_VIDEO_SRC = "/videos/hero-kel-suu-mobile.mp4";
/** Тот же запрос — в hero.css для постера: первый кадр нужного ролика виден до загрузки и при «меньше движения» */
const MOBILE_MEDIA = "(max-width: 767px) and (orientation: portrait)";

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
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={MOBILE_VIDEO_SRC} type="video/mp4" media={MOBILE_MEDIA} />
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
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
