import { Icon } from "@/components/ui/icon/Icon";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./about-values.css";

export function AboutValues({ dict }: { dict: Dictionary }) {
  return (
    <ul className="about-values">
      {dict.about.values.map((value) => (
        <li key={value.title} className="about-values-card">
          <span className="about-values-icon">
            <Icon name="check" size={18} />
          </span>
          <h3 className="about-values-name">{value.title}</h3>
          <p className="about-values-text">{value.text}</p>
        </li>
      ))}
    </ul>
  );
}
