import { Icon } from "@/components/ui/icon/Icon";
import { ABOUT_VALUE_ICONS } from "@/utils/about/value-icons";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./about-values.css";

export function AboutValues({ dict }: { dict: Dictionary }) {
  return (
    <ul className="about-values">
      {dict.about.values.map((value, i) => (
        <li key={value.title} className="about-values-card">
          <span className="about-values-icon" aria-hidden="true">
            <Icon name={ABOUT_VALUE_ICONS[i] ?? "check"} size={20} strokeWidth={2} />
          </span>
          <h3 className="about-values-name">{value.title}</h3>
          <p className="about-values-text">{value.text}</p>
        </li>
      ))}
    </ul>
  );
}
