import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import "./empty-offers.css";

export function EmptyOffers({ icon, title, text, action }: { icon: IconName; title: string; text: string; action: ReactNode }) {
  return (
    <div className="empty-offers">
      <span className="empty-offers-icon">
        <Icon name={icon} size={30} />
      </span>
      <h2 className="empty-offers-title">{title}</h2>
      <p className="empty-offers-text">{text}</p>
      {action}
    </div>
  );
}
