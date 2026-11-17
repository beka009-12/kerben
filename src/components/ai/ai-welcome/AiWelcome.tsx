import { Icon } from "@/components/ui/icon/Icon";
import "./ai-welcome.css";

interface AiWelcomeProps {
  title: string;
  text: string;
  suggestions: { title: string; prompt: string }[];
  onPick: (prompt: string) => void;
}

export function AiWelcome({ title, text, suggestions, onPick }: AiWelcomeProps) {
  return (
    <div className="ai-welcome">
      <div className="ai-welcome-intro">
        <span className="ai-welcome-mark" aria-hidden="true">
          <Icon name="sparkle" size={18} />
        </span>
        <h1 className="ai-welcome-title">{title}</h1>
        <p className="ai-welcome-text">{text}</p>
      </div>
      <ul className="ai-welcome-suggestions">
        {suggestions.map((item) => (
          <li key={item.title}>
            <button type="button" className="ai-welcome-suggestion" onClick={() => onPick(item.prompt)} title={item.prompt}>
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
