"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { ToastContext, useAdminToastState } from "@/utils/admin/use-admin-toast";
import "./admin-toast.css";

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const { toast, notify } = useAdminToastState();

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="admin-toast-region" role="status" aria-live="polite">
        {toast && (
          <p key={toast.id} className={toast.tone === "error" ? "admin-toast admin-toast-error" : "admin-toast"}>
            <Icon name={toast.tone === "error" ? "x" : "check"} size={18} />
            {toast.text}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}
