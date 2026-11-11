import Image from "next/image";
import type { Tour } from "@/types/tour";
import "./tour-highlights.css";

export function TourHighlights({ tour, title }: { tour: Tour; title: string }) {
  if (tour.highlights.length === 0) return null;
  return (
    <section className="tour-highlights" aria-labelledby="highlights-title">
      <h2 id="highlights-title" className="tour-highlights-title">
        {title}
      </h2>
      <ul className="tour-highlights-list">
        {tour.highlights.map((item) => (
          <li key={item.title} className="tour-highlights-item">
            <div className="tour-highlights-media">
              <Image src={item.image} alt={item.title} fill sizes="(min-width: 900px) 220px, 45vw" className="tour-highlights-image" />
            </div>
            <h3 className="tour-highlights-name">{item.title}</h3>
            <p className="tour-highlights-text">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
