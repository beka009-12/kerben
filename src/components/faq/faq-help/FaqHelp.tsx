import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import "./faq-help.css";

export function FaqHelp({
  title,
  text,
  askLabel,
  askHref,
  contactLabel,
  contactHref,
}: {
  title: string;
  text: string;
  askLabel: string;
  askHref: string;
  contactLabel: string;
  contactHref: string;
}) {
  return (
    <aside className="faq-help">
      <span className="faq-help-icon" aria-hidden="true">
        <Icon name="help" size={22} />
      </span>
      <h2 className="faq-help-title">{title}</h2>
      <p className="faq-help-text">{text}</p>
      <div className="faq-help-actions">
        <Link href={askHref} className="faq-help-button faq-help-button-primary">
          <Icon name="chat" size={18} />
          {askLabel}
        </Link>
        <Link href={contactHref} className="faq-help-button">
          <Icon name="headset" size={18} />
          {contactLabel}
        </Link>
      </div>
    </aside>
  );
}
