"use client";

import { useModal } from "@/utils/ui/use-modal";
import "./admin-confirm.css";

export function AdminConfirm({
  open,
  title,
  text,
  confirmLabel = "Да, удалить",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useModal(open);

  return (
    <dialog ref={ref} className="admin-confirm" aria-labelledby="admin-confirm-title" onCancel={onCancel}>
      <h2 id="admin-confirm-title" className="admin-confirm-title">
        {title}
      </h2>
      <p className="admin-confirm-text">{text}</p>
      <div className="admin-confirm-actions">
        <button type="button" className="admin-confirm-cancel" onClick={onCancel}>
          Отмена
        </button>
        <button type="button" className="admin-confirm-danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Удаляем…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
