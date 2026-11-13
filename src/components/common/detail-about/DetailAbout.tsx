import { DetailSection } from "@/components/common/detail-section/DetailSection";
import "./detail-about.css";

export interface DetailFact {
  label: string;
  value: string;
}

export function DetailAbout({ title, text, facts }: { title: string; text?: string; facts: DetailFact[] }) {
  return (
    <DetailSection id="overview" title={title}>
      {text && <p className="detail-about-text">{text}</p>}
      {facts.length > 0 && (
        <dl className="detail-about-facts">
          {facts.map((fact) => (
            <div key={fact.label} className="detail-about-fact">
              <dt className="detail-about-label">{fact.label}</dt>
              <dd className="detail-about-value">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </DetailSection>
  );
}
