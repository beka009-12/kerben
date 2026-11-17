"use client";

import { useId } from "react";
import { useBackdropDismiss } from "@/utils/ui/use-backdrop-dismiss";
import { useModal } from "@/utils/ui/use-modal";
import "./confirm-dialog.css";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Что именно удаляем — показывается цитатой под заголовком */
  subject?: string;
  text: string;
  cancelLabel: string;
  confirmLabel: string;
  busy?: boolean;
  busyLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Нативный modal dialog: поверх всей страницы, держит фокус внутри, Esc и подложка отменяют, фокус возвращается на кнопку */
export function ConfirmDialog({
  open,
  title,
  subject,
  text,
  cancelLabel,
  confirmLabel,
  busy = false,
  busyLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useModal(open);
  const backdrop = useBackdropDismiss(onCancel);
  const id = useId();

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-text`}
      onCancel={(event) => {
        event.preventDefault();
        // React пробрасывает cancel по дереву компонентов: без этого Esc закрыл бы и родительский dialog (AdminEditor)
        event.stopPropagation();
        onCancel();
      }}
      {...backdrop}
    >
      <div className="confirm-dialog-body">
        <h2 id={`${id}-title`} className="confirm-dialog-title">
          {title}
        </h2>
        {subject && (
          <p className="confirm-dialog-subject">
            <q>{subject}</q>
          </p>
        )}
        <p id={`${id}-text`} className="confirm-dialog-text">
          {text}
        </p>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-dialog-danger" onClick={onConfirm} disabled={busy}>
            {busy && busyLabel ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
