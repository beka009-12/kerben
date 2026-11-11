import Link from "next/link";
import type { ReactNode } from "react";
import "./ai-markdown.css";

export function AiMarkdown({ text, locale }: { text: string; locale: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className="ai-markdown">
      {blocks.map((block, i) => (
        <Block key={i} block={block} locale={locale} />
      ))}
    </div>
  );
}

function Block({ block, locale }: { block: string; locale: string }) {
  const lines = block.split("\n").filter((line) => line.trim());
  if (!lines.length) return null;

  const heading = lines[0].match(/^#{1,4}\s+(.*)$/);
  if (heading && lines.length === 1) return <h4 className="ai-markdown-heading">{inline(heading[1], locale)}</h4>;

  if (lines.every((line) => /^\s*[-*•]\s+/.test(line))) {
    return (
      <ul className="ai-markdown-list">
        {lines.map((line, i) => (
          <li key={i} className="ai-markdown-item">
            {inline(line.replace(/^\s*[-*•]\s+/, ""), locale)}
          </li>
        ))}
      </ul>
    );
  }

  if (lines.every((line) => /^\s*\d+[.)]\s+/.test(line))) {
    return (
      <ol className="ai-markdown-list ai-markdown-list-numbered">
        {lines.map((line, i) => (
          <li key={i} className="ai-markdown-item">
            {inline(line.replace(/^\s*\d+[.)]\s+/, ""), locale)}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p className="ai-markdown-paragraph">
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {inline(line.replace(/^#{1,4}\s+/, ""), locale)}
        </span>
      ))}
    </p>
  );
}

function inline(text: string, locale: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\/tours\/[a-z0-9-]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="ai-markdown-code">{part.slice(1, -1)}</code>;
    if (/^\/tours\/[a-z0-9-]+$/.test(part)) {
      return (
        <Link key={i} href={`/${locale}${part}`} className="ai-markdown-link">
          {part.replace("/tours/", "")}
        </Link>
      );
    }
    return part;
  });
}
