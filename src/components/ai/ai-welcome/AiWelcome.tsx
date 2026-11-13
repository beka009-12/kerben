import { Icon } from "@/components/ui/icon/Icon";
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
          <Icon name="sparkle" size={18} />
        </span>
        <h1 className="ai-welcome-title">{title}</h1>
        <p className="ai-welcome-text">{text}</p>
      </div>
      <ul className="ai-welcome-suggestions">
        {suggestions.map((item) => (
          <li key={item.title}>
            <button type="button" className="ai-welcome-suggestion" onClick={() => onPick(item.prompt)}>
              <span className="ai-welcome-icon" aria-hidden="true">
                <Icon name="sparkle" size={18} />
              </span>
              <span className="ai-welcome-suggestion-title">{item.title}</span>
              <span className="ai-welcome-suggestion-text">{item.prompt}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
