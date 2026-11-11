"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { useRequestToast } from "@/utils/requests/use-request-toast";
import "./request-toast.css";

export function RequestToast() {
  const { locale, dict, t, update, name, className, icon, close } = useRequestToast();
  if (!update) return null;
  return (
    <div className={className} role="status" aria-live="polite">
      <span className="request-toast-icon" aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <span className="request-toast-body">
        <strong className="request-toast-title">{t.toast[update.status]}</strong>
        {name && <span className="request-toast-text">{name}</span>}
        <Link href={`/${locale}/trips`} className="request-toast-link" onClick={close}>
          {dict.nav.trips}
          <Icon name="arrowRight" size={14} />
        </Link>
      </span>
      <button type="button" className="request-toast-close" onClick={close} aria-label={dict.a11y.close}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
