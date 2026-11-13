import Image from "next/image";
import { Icon } from "@/components/ui/icon/Icon";
import type { AboutSectionItem } from "@/utils/api/catalog";
import "./about-sections.css";

type Block = { kind: "text"; text: string } | { kind: "list"; items: string[] };

/** Текст раздела из backend: первый абзац — заголовок, строки «• …» — список с галочками */
function parse(text: string): { lead: string; blocks: Block[] } {
  const parts = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  const [lead = "", ...rest] = parts;
  const blocks = rest.map<Block>((part) => {
    const lines = part.split("\n").map((line) => line.trim());
    return lines.every((line) => /^[•\-–]/.test(line))
      ? { kind: "list", items: lines.map((line) => line.replace(/^[•\-–]\s*/, "").replace(/\.$/, "")) }
      : { kind: "text", text: part };
  });
  return { lead, blocks };
}

export function AboutSections({ sections }: { sections: AboutSectionItem[] }) {
  if (sections.length === 0) return null;
  return (
    <div className="about-sections">
      {sections.map((section, i) => {
        const { lead, blocks } = parse(section.text);
        return (
          <article key={section.id} className={i % 2 ? "about-sections-row about-sections-row-flip" : "about-sections-row"}>
            {section.image && (
              <div className="about-sections-media">
                <Image src={section.image} alt="" fill sizes="(min-width: 1024px) 568px, 100vw" className="about-sections-image" />
              </div>
            )}
            <div className="about-sections-copy">
              <span className="about-sections-number">{String(i + 1).padStart(2, "0")}</span>
              {section.title && <p className="about-sections-kicker">{section.title}</p>}
              {lead && <h3 className="about-sections-title">{lead}</h3>}
              {blocks.map((block, j) =>
                block.kind === "text" ? (
                  <p key={j} className="about-sections-text">
                    {block.text}
                  </p>
                ) : (
                  <ul key={j} className="about-sections-list">
                    {block.items.map((item) => (
                      <li key={item} className="about-sections-item">
                        <Icon name="check" size={18} className="about-sections-check" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
