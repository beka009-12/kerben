"use client";

import { Icon } from "@/components/ui/icon/Icon";
import { usePickButton, type PickButtonOptions } from "@/utils/trip/use-pick-button";
import "./pick-button.css";

export function PickButton(props: PickButtonOptions) {
  const { hidden, picked, toggle, className, title, label } = usePickButton(props);
  if (hidden) return null;

  return (
    <button type="button" className={className} aria-pressed={picked} title={title} onClick={toggle}>
      {picked && (
        <span className="pick-button-check" aria-hidden="true">
          <Icon name="check" size={14} />
        </span>
      )}
      {label}
    </button>
  );
}
