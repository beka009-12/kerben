"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { isLite, onLite } from "@/utils/ui/use-lite-mode";

const VIDEO_SRC = "/videos/hero-kerben-hd.mp4";
/** На вертикальном экране 16:9 обрезается до узкой полосы — там играет отдельный вертикальный ролик */
const MOBILE_VIDEO_SRC = "/videos/hero-kel-suu-mobile.mp4";
/** Тот же запрос — в hero.css для постера: первый кадр нужного ролика виден до загрузки и при «меньше движения» */
const MOBILE_MEDIA = "(max-width: 767px) and (orientation: portrait)";

interface HeroVideoProps {
  pauseLabel: string;
  playLabel: string;
}

async function start(video: HTMLVideoElement) {
  try {
    await video.play();
  } catch {
    // Браузер запретил автозапуск: событие play не придёт, остаётся постер и кнопка «Воспроизвести»
  }
}

/** choice: null — решает автоматика; true/false — человек сам нажал «Воспроизвести»/«Пауза» */
function syncVideo(video: HTMLVideoElement, visible: boolean, choice: boolean | null) {
  const auto = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !isLite();
  const want = visible && (choice ?? auto);
  if (want && video.paused) void start(video);
  else if (!want && !video.paused) video.pause();
}

/**
 * Ролик играет, только пока первый экран виден: ниже по странице декодер не грузит слабый телефон.
 * Сам запускается, если нет «меньше движения» и lite (слабое устройство или экономия трафика) —
 * иначе остаётся постер, а ролик (preload="none") даже не скачивается, пока не нажать «Воспроизвести».
 * Выбор человека кнопкой важнее автоматики.
 */
export function HeroVideo({ pauseLabel, playLabel }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const choiceRef = useRef<boolean | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const sync = () => syncVideo(video, visibleRef.current, choiceRef.current);
    const offLite = onLite(sync);
    if (typeof IntersectionObserver === "undefined") {
      visibleRef.current = true;
      sync();
      return offLite;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      offLite();
    };
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    choiceRef.current = video.paused;
    syncVideo(video, visibleRef.current, choiceRef.current);
  }

  return (
    <>
      <video
        ref={videoRef}
        className="hero-video"
        muted
        loop
        playsInline
        preload="none"
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
