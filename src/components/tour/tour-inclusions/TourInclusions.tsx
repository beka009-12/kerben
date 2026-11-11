import { Icon } from "@/components/ui/icon/Icon";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import type { Tour } from "@/types/tour";
import { inclusionLabel } from "@/utils/inclusions";
import "./tour-inclusions.css";

export function TourInclusions({ tour, dict }: { tour: Tour; dict: Dictionary }) {
  const t = dict.tour;
  if (tour.included.length === 0 && tour.excluded.length === 0) return null;
  return (
    <section id="inclusions" className="tour-inclusions" aria-label={t.tabs.inclusions}>
      <div className="tour-inclusions-box tour-inclusions-box-yes">
        <h2 className="tour-inclusions-title">{t.included}</h2>
        <ul className="tour-inclusions-list">
          {tour.included.map((key) => (
            <li key={key} className="tour-inclusions-item">
              <span className="tour-inclusions-icon tour-inclusions-icon-yes">
                <Icon name="check" size={14} />
              </span>
              {inclusionLabel(key, t.inclusions)}
            </li>
          ))}
        </ul>
      </div>
      <div className="tour-inclusions-box tour-inclusions-box-no">
        <h2 className="tour-inclusions-title">{t.notIncluded}</h2>
        <ul className="tour-inclusions-list">
          {tour.excluded.map((key) => (
            <li key={key} className="tour-inclusions-item">
              <span className="tour-inclusions-icon tour-inclusions-icon-no">
                <Icon name="x" size={14} />
              </span>
              {inclusionLabel(key, t.inclusions)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
