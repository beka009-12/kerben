import Image from "next/image";
import { Icon } from "@/components/ui/icon/Icon";
import { AI_WELCOME_ICONS } from "@/utils/ai/welcome-icons";
import mark from "@/assets/brand/logo-mark.png";
import "./ai-welcome.css";

export function AiWelcome({
  title,
  text,
  suggestions,
  onPick,
}: {
  title: string;
  text: string;
  suggestions: { title: string; prompt: string }[];
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="ai-welcome">
      <div className="ai-welcome-intro">
        <span className="ai-welcome-mark" aria-hidden="true">
          <Image src={mark} alt="" width={44} height={46} loading="eager" />
        </span>
        <h1 className="ai-welcome-title">{title}</h1>
        <p className="ai-welcome-text">{text}</p>
      </div>
      <ul className="ai-welcome-suggestions">
        {suggestions.map((item, i) => (
          <li key={item.title}>
            <button type="button" className="ai-welcome-suggestion" onClick={() => onPick(item.prompt)}>
              <Icon name={AI_WELCOME_ICONS[i % AI_WELCOME_ICONS.length]} size={18} className="ai-welcome-icon" />
              <span className="ai-welcome-suggestion-title">{item.title}</span>
              <span className="ai-welcome-suggestion-text">{item.prompt}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
