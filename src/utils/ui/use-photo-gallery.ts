"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";

export interface GalleryLabels {
  photos: string;
  photo: string;
  close: string;
  prev: string;
  next: string;
}

export function usePhotoGallery(rawImages: string[]) {
  const images = [...new Set(rawImages.filter(Boolean))];
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const viewerThumbsRef = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);

  const go = (next: number) => setIndex((next + count) % count);

  useEffect(() => {
    for (const strip of [thumbsRef.current, viewerThumbsRef.current]) {
      const thumb = strip?.children[index] as HTMLElement | undefined;
      if (!strip || !thumb) continue;
      strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [index, viewer]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (viewer && !dialog.open) dialog.showModal();
    if (!viewer && dialog.open) dialog.close();
  }, [viewer]);

  useEffect(() => {
    if (!viewer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer, count]);

  const swipe = {
    onTouchStart: (event: TouchEvent) => {
      touch.current = event.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (event: TouchEvent) => {
      const start = touch.current;
      const end = event.changedTouches[0]?.clientX;
      touch.current = null;
      if (start === null || end === undefined || Math.abs(end - start) < 40) return;
      go(index + (end < start ? 1 : -1));
    },
  };

  return { images, count, index, setIndex, viewer, setViewer, dialogRef, thumbsRef, viewerThumbsRef, go, swipe };
}
