"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon/Icon";
import { usePhotoGallery, type GalleryLabels } from "@/utils/ui/use-photo-gallery";
import "./photo-gallery.css";

// Каждый новый URL /_next/image — это заново скачанный с backend оригинал (0.3–1 МБ, медленно) и новое кодирование.
// Сцена, просмотрщик и размытый фон берут один URL, обе ленты миниатюр — другой: на фото два запроса, а не пять
const MAIN_SIZES = "(min-width: 1100px) 1240px, 100vw";
const MAIN_QUALITY = 90;
const THUMB_SIZES = "104px";

export function PhotoGallery({
  images: rawImages,
  name,
  labels,
  layout = "strip",
  fit = "cover",
  caption,
}: {
  images: string[];
  name: string;
  labels: GalleryLabels;
  layout?: "strip" | "mosaic";
  fit?: "cover" | "contain";
  caption?: string;
}) {
  const { images, count, index, setIndex, viewer, setViewer, dialogRef, thumbsRef, viewerThumbsRef, go, swipe } = usePhotoGallery(rawImages);

  if (count === 0) return null;

  const openAt = (i: number) => {
    setIndex(i);
    setViewer(true);
  };

  const mosaic = images.slice(0, 3);

  return (
    <div className={layout === "mosaic" ? "photo-gallery photo-gallery-mosaic-wrap" : "photo-gallery"}>
      {layout === "mosaic" ? (
        <div className={`photo-gallery-mosaic photo-gallery-mosaic-${mosaic.length}`}>
          {mosaic.map((src, i) => (
            <button key={src} type="button" className="photo-gallery-tile" onClick={() => openAt(i)} aria-label={`${labels.photo} ${i + 1} / ${count}`}>
              <Image
                src={src}
                alt={i === 0 ? name : ""}
                fill
                sizes={i === 0 ? "(min-width: 1024px) 820px, 100vw" : "(min-width: 1024px) 400px, 50vw"}
                quality={85}
                preload={i === 0}
                className="photo-gallery-image"
              />
              {i === mosaic.length - 1 && count > mosaic.length && (
                <span className="photo-gallery-more">
                  <Icon name="image" size={16} />+{count - mosaic.length}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className={fit === "contain" ? "photo-gallery-stage photo-gallery-stage-contain" : "photo-gallery-stage"} {...swipe}>
            {fit === "contain" && (
              <Image
                key={`${images[index]}-backdrop`}
                src={images[index]}
                alt=""
                fill
                sizes={MAIN_SIZES}
                quality={MAIN_QUALITY}
                loading={index === 0 ? "eager" : "lazy"}
                aria-hidden
                className="photo-gallery-backdrop"
              />
            )}
            <button type="button" className="photo-gallery-open" onClick={() => setViewer(true)} aria-label={`${labels.photo} ${index + 1} / ${count}`}>
              <Image
                key={images[index]}
                src={images[index]}
                alt={index === 0 ? name : ""}
                fill
                sizes={MAIN_SIZES}
                quality={MAIN_QUALITY}
                loading={index === 0 ? "eager" : "lazy"}
                className="photo-gallery-image"
              />
            </button>
            {count > 1 && (
              <>
                <button type="button" className="photo-gallery-arrow photo-gallery-prev" onClick={() => go(index - 1)} aria-label={labels.prev}>
                  <Icon name="chevronLeft" size={24} />
                </button>
                <button type="button" className="photo-gallery-arrow photo-gallery-next" onClick={() => go(index + 1)} aria-label={labels.next}>
                  <Icon name="chevronRight" size={24} />
                </button>
              </>
            )}
            <span className="photo-gallery-count" aria-live="polite">
              {caption ? `${caption} · ` : ""}
              {index + 1} / {count}
            </span>
          </div>

          {count > 1 && (
            <div ref={thumbsRef} className="photo-gallery-thumbs" role="tablist" aria-label={labels.photos}>
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`${labels.photo} ${i + 1}`}
                  className={i === index ? "photo-gallery-thumb photo-gallery-thumb-active" : "photo-gallery-thumb"}
                  onClick={() => setIndex(i)}
                >
                  <Image src={src} alt="" fill sizes={THUMB_SIZES} loading="lazy" className="photo-gallery-image" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <dialog ref={dialogRef} className="photo-viewer" onClose={() => setViewer(false)} aria-label={name}>
        {viewer && (
          <div className="photo-viewer-inner" {...swipe}>
            <Image key={`${images[index]}-ambient`} src={images[index]} alt="" fill sizes={MAIN_SIZES} quality={MAIN_QUALITY} aria-hidden className="photo-viewer-ambient" />
            <div className="photo-viewer-bar">
              <div className="photo-viewer-heading">
                <span className="photo-viewer-title">{name}</span>
                <span className="photo-viewer-count" aria-live="polite">
                  {index + 1} / {count}
                </span>
              </div>
              <button type="button" className="photo-viewer-button photo-viewer-close" onClick={() => setViewer(false)} aria-label={labels.close}>
                <Icon name="close" size={22} />
              </button>
            </div>
            <div className="photo-viewer-stage">
              <Image
                key={images[index]}
                src={images[index]}
                alt={`${name} — ${labels.photo} ${index + 1}`}
                fill
                sizes={MAIN_SIZES}
                quality={MAIN_QUALITY}
                className="photo-viewer-image"
              />
              {count > 1 && (
                <>
                  <button type="button" className="photo-viewer-button photo-viewer-arrow photo-viewer-prev" onClick={() => go(index - 1)} aria-label={labels.prev}>
                    <Icon name="chevronLeft" size={26} />
                  </button>
                  <button type="button" className="photo-viewer-button photo-viewer-arrow photo-viewer-next" onClick={() => go(index + 1)} aria-label={labels.next}>
                    <Icon name="chevronRight" size={26} />
                  </button>
                </>
              )}
            </div>
            {count > 1 && (
              <div ref={viewerThumbsRef} className="photo-viewer-thumbs" role="tablist" aria-label={labels.photos}>
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${labels.photo} ${i + 1}`}
                    className={i === index ? "photo-viewer-thumb photo-viewer-thumb-active" : "photo-viewer-thumb"}
                    onClick={() => setIndex(i)}
                  >
                    <Image src={src} alt="" fill sizes={THUMB_SIZES} className="photo-viewer-thumb-image" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
