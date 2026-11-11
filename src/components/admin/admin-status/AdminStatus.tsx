"use client";

import { Select } from "@/components/ui/select/Select";
import type { RequestStatus } from "@/utils/admin/resources";
import { statusOptions } from "@/utils/admin/status-options";
import "./admin-status.css";

export function AdminStatus({ value, label, onChange }: { value: RequestStatus; label: string; onChange: (next: RequestStatus) => void }) {
  return <Select variant="pill" value={value} options={statusOptions(value)} onChange={onChange} label={`Статус заявки ${label}`} />;
}
