import { Icon } from "@/components/ui/icon/Icon";
import { ABOUT_VALUE_ICONS } from "@/utils/about/value-icons";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./about-values.css";

export function AboutValues({ dict }: { dict: Dictionary }) {
  const t = dict.about;
  return (
    <div className="about-values">
      <ul className="about-values-list">
        {t.values.map((value, i) => (
          <li key={value.title} className="about-values-card">
            <span className="about-values-icon">
              <Icon name={ABOUT_VALUE_ICONS[i]} size={22} />
            </span>
            <h3 className="about-values-name">{value.title}</h3>
            <p className="about-values-card-text">{value.text}</p>
          </li>
        ))}
      </ul>
      <div className="about-values-story">
        <h2 className="about-values-title">{t.storyTitle}</h2>
        <p className="about-values-text">{t.story}</p>
      </div>
    </div>
  );
}
