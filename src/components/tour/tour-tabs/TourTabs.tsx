"use client";

import { useTourTabs, type SectionId } from "@/utils/tour/use-tour-tabs";
import "./tour-tabs.css";

export type { SectionId } from "@/utils/tour/use-tour-tabs";

export function TourTabs({ hide = [] }: { hide?: SectionId[] }) {
  const { SECTIONS, dict, active, navRef, stripRef, linkRefs, goTo } = useTourTabs({ hide });

  return (
    <nav ref={navRef} className="tour-tabs" aria-label={dict.tour.about}>
      <div ref={stripRef} className="container tour-tabs-inner">
        {SECTIONS.map((id) => (
          <a
            key={id}
            ref={(el) => {
              if (el) linkRefs.current.set(id, el);
              else linkRefs.current.delete(id);
            }}
            href={`#${id}`}
            onClick={(event) => goTo(event, id)}
            className={active === id ? "tour-tabs-link tour-tabs-link-active" : "tour-tabs-link"}
            aria-current={active === id ? "location" : undefined}
          >
            {dict.tour.tabs[id]}
          </a>
        ))}
      </div>
    </nav>
  );
}
