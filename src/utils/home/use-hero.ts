"use client";

import { useEffect, useRef, useState } from "react";
import { useSlideshow } from "@/utils/hooks/useSlideshow";
import { useI18n } from "@/utils/i18n/I18nProvider";

export const SLIDE_MS = 3500;

export const HERO_VIDEOS = ["/videos/hero-kerben-hd.mp4"];

export const HERO_POSTER = "/images/hero/hero-poster.webp";

export function useHero(images: string[]) {
  const { locale, dict } = useI18n();
  const t = dict.hero;
  const [videoFailed, setVideoFailed] = useState(false);
  // Фото — только если видео не загрузилось
  const photos = videoFailed;
  const count = Math.min(images.length, t.slides.length);
  const { index, previous, paused, goTo } = useSlideshow(photos ? count : 0, SLIDE_MS);

  const [clip, setClip] = useState(0);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  // Играет только текущий ролик, остальные стоят; при «меньше движения» — первый кадр без воспроизведения
  useEffect(() => {
    if (photos) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i !== clip) {
        video.pause();
        return;
      }
      video.currentTime = 0;
      if (!still) void video.play().catch(() => {});
    });
  }, [clip, photos]);

  const nextClip = () => setClip((current) => (current + 1) % HERO_VIDEOS.length);

  const videoRef = (i: number) => (video: HTMLVideoElement | null) => {
    videos.current[i] = video;
    // Ошибку загрузки ловит onError; здесь — та, что случилась ещё до того, как React подключился
    if (i === 0 && video?.error) setVideoFailed(true);
  };

  return {
    t,
    slide: t.slides[index],
    slides: images.slice(0, count),
    labels: t.slides.slice(0, count).map((item) => item.place),
    toursHref: `/${locale}/tours`,
    chatHref: `/${locale}/chat?ask=${encodeURIComponent(t.secondaryAsk)}`,
    poster: HERO_POSTER,
    photos,
    videoRef,
    clip,
    // Ролик закончился — плавно включаем следующий
    onClipEnd: nextClip,
    // Первый ролик не загрузился — показываем фото; сломанный следующий просто пропускаем
    onClipError: (i: number) => (i === 0 ? setVideoFailed(true) : i === clip && nextClip()),
    index,
    previous,
    paused,
    goTo,
  };
}
