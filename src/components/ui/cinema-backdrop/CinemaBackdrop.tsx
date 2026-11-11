import Image from "next/image";
import { MOTIONS } from "@/utils/ui/cinema-motions";
import "./cinema-backdrop.css";

export function CinemaBackdrop({
  images,
  index,
  previous = -1,
  sizes = "100vw",
  quality,
  fast = false,
}: {
  images: string[];
  index: number;
  previous?: number;
  sizes?: string;
  quality?: number;
  fast?: boolean;
}) {
  return (
    <div className={fast ? "cinema-backdrop cinema-backdrop-fast" : "cinema-backdrop"} aria-hidden="true">
      {images.map((src, i) => {
        const live = i === index || i === previous;
        const motion = MOTIONS[i % MOTIONS.length];
        return (
          <div key={src} className={i === index ? "cinema-backdrop-layer cinema-backdrop-layer-active" : "cinema-backdrop-layer"}>
            <Image
              src={src}
              alt=""
              fill
              sizes={sizes}
              quality={quality}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              className={live ? `cinema-backdrop-image cinema-backdrop-${motion}` : "cinema-backdrop-image"}
            />
          </div>
        );
      })}
    </div>
  );
}
